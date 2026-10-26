package com.hisabloop.receipt;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.math.BigDecimal;
import java.time.Clock;
import java.util.LinkedHashMap;
import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.hisabloop.audit.AuditService;
import com.hisabloop.claim.ClaimDtos;
import com.hisabloop.claim.ClaimQueryService;
import com.hisabloop.claim.ClaimRepository;
import com.hisabloop.claim.ClaimService;
import com.hisabloop.claim.ClaimStatus;
import com.hisabloop.claim.ExpenseClaim;
import com.hisabloop.common.error.ApiException;
import com.hisabloop.common.util.Hashing;
import com.hisabloop.company.CompanyAccess;
import com.hisabloop.company.CompanyAccessService;
import com.hisabloop.company.Permission;
import com.hisabloop.company.Role;
import com.hisabloop.config.AppProperties;
import com.hisabloop.policy.ExpenseCategoryRepository;
import com.hisabloop.policy.PolicyEvaluator;
import com.hisabloop.receipt.ocr.ReceiptExtraction;
import com.hisabloop.receipt.ocr.ReceiptProcessor;
import com.hisabloop.receipt.storage.FileStorage;

@Service
public class ReceiptService {

    private static final Map<String, String> ALLOWED_TYPES = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp",
            "application/pdf", "pdf");

    private final CompanyAccessService accessService;
    private final ClaimRepository claims;
    private final ClaimQueryService claimQueries;
    private final ReceiptRepository receipts;
    private final FileStorage storage;
    private final ReceiptProcessor processor;
    private final PolicyEvaluator policyEvaluator;
    private final ExpenseCategoryRepository categories;
    private final AuditService audit;
    private final ObjectMapper objectMapper;
    private final AppProperties properties;
    private final Clock clock;

    public ReceiptService(CompanyAccessService accessService, ClaimRepository claims, ClaimQueryService claimQueries,
            ReceiptRepository receipts, FileStorage storage, ReceiptProcessor processor,
            PolicyEvaluator policyEvaluator, ExpenseCategoryRepository categories, AuditService audit,
            ObjectMapper objectMapper, AppProperties properties, Clock clock) {
        this.accessService = accessService;
        this.claims = claims;
        this.claimQueries = claimQueries;
        this.receipts = receipts;
        this.storage = storage;
        this.processor = processor;
        this.policyEvaluator = policyEvaluator;
        this.categories = categories;
        this.audit = audit;
        this.objectMapper = objectMapper;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional
    public ClaimDtos.ReceiptDto upload(String companyId, String claimId, MultipartFile file) {
        CompanyAccess access = accessService.require(companyId, Permission.CREATE_CLAIM);
        ExpenseClaim claim = claims.findForUpdate(claimId, companyId).orElseThrow(() -> ApiException.notFound("Claim"));
        claimQueries.ensureVisible(access, claim);
        requireEditable(access, claim);

        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("empty_file", "No file uploaded");
        }
        if (file.getSize() > properties.storage().maxFileBytes()) {
            throw ApiException.badRequest("file_too_large", "File exceeds the maximum upload size");
        }
        byte[] content;
        try {
            content = file.getBytes();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        String detected = detectType(content);
        if (detected == null || !ALLOWED_TYPES.containsKey(detected)) {
            throw ApiException.badRequest("unsupported_file", "Only JPEG, PNG, WebP images and PDF files are accepted");
        }

        String sha = Hashing.sha256Hex(content);
        String key = storage.store(companyId, content, ALLOWED_TYPES.get(detected));

        Receipt r = new Receipt();
        r.setCompanyId(companyId);
        r.setClaimId(claim.getId());
        r.setOriginalFilename(safeFilename(file.getOriginalFilename()));
        r.setContentType(detected);
        r.setSizeBytes(content.length);
        r.setStorageKey(key);
        r.setSha256(sha);
        r.setProcessingStatus(ProcessingStatus.UPLOADED);
        r.setUploadedByUserId(access.userId());
        receipts.saveAndFlush(r);

        claim.setHasReceipt(true);
        policyEvaluator.evaluate(claim);
        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("receiptId", r.getId());
        meta.put("filename", r.getOriginalFilename());
        meta.put("sha256", sha);
        audit.record(companyId, ClaimService.ENTITY, claim.getId(), claim.getReference(), "RECEIPT_UPLOADED",
                ClaimService.actor(access), claim.getStatus().name(), claim.getStatus().name(), meta);
        return ClaimQueryService.receipt(r);
    }

    /**
     * Runs the configured provider and pre-fills the draft claim with the suggested values. The
     * employee still has to review and confirm the claim.
     */
    @Transactional
    public ClaimDtos.ClaimDetail process(String companyId, String receiptId) {
        CompanyAccess access = accessService.require(companyId, Permission.CREATE_CLAIM);
        Receipt r = receipts.findByIdAndCompanyId(receiptId, companyId)
                .orElseThrow(() -> ApiException.notFound("Receipt"));
        ExpenseClaim claim = claims.findForUpdate(r.getClaimId(), companyId)
                .orElseThrow(() -> ApiException.notFound("Claim"));
        claimQueries.ensureVisible(access, claim);
        requireEditable(access, claim);

        ReceiptExtraction x;
        try {
            x = processor.process(storage.load(r.getStorageKey()), r.getContentType(), r.getOriginalFilename());
        } catch (RuntimeException e) {
            x = new ReceiptExtraction(ProcessingStatus.FAILED, processor.name(), null, null, null, null, null, null,
                    null, null, null, null, null, null, null, "Receipt processing failed. Enter the details manually.");
        }
        r.setProvider(x.provider());
        r.setProcessingStatus(x.status());
        r.setConfidence(x.confidence());
        r.setErrorMessage(x.message() == null ? null : x.message().substring(0, Math.min(500, x.message().length())));
        r.setExtractedJson(toJson(x));
        r.setProcessedAt(clock.instant());

        if (x.status() == ProcessingStatus.COMPLETED && claim.getStatus() == ClaimStatus.DRAFT) {
            applyExtraction(claim, x);
        }
        policyEvaluator.evaluate(claim);
        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("receiptId", r.getId());
        meta.put("provider", x.provider());
        meta.put("result", x.status().name());
        if (x.confidence() != null) {
            meta.put("confidence", x.confidence());
        }
        audit.record(companyId, ClaimService.ENTITY, claim.getId(), claim.getReference(), "RECEIPT_PROCESSED",
                ClaimService.actor(access), claim.getStatus().name(), claim.getStatus().name(), meta);
        return claimQueries.detail(access, claim);
    }

    @Transactional(readOnly = true)
    public ClaimDtos.ReceiptDto get(String companyId, String receiptId) {
        Receipt r = visibleReceipt(companyId, receiptId);
        return ClaimQueryService.receipt(r);
    }

    @Transactional(readOnly = true)
    public ReceiptFile download(String companyId, String receiptId) {
        Receipt r = visibleReceipt(companyId, receiptId);
        return new ReceiptFile(r.getOriginalFilename(), r.getContentType(), storage.load(r.getStorageKey()));
    }

    private Receipt visibleReceipt(String companyId, String receiptId) {
        CompanyAccess access = accessService.require(companyId, Permission.VIEW_CLAIMS);
        Receipt r = receipts.findByIdAndCompanyId(receiptId, companyId)
                .orElseThrow(() -> ApiException.notFound("Receipt"));
        ExpenseClaim claim = claims.findByIdAndCompanyId(r.getClaimId(), companyId)
                .orElseThrow(() -> ApiException.notFound("Receipt"));
        claimQueries.ensureVisible(access, claim);
        return r;
    }

    private void applyExtraction(ExpenseClaim c, ReceiptExtraction x) {
        if (x.vendorName() != null) {
            c.setVendorName(x.vendorName());
        }
        if (x.receiptDate() != null) {
            c.setReceiptDate(x.receiptDate());
        }
        if (x.totalAmount() != null) {
            c.setTotalAmount(x.totalAmount());
        }
        c.setTaxableAmount(x.taxableAmount());
        c.setCgstAmount(nz(x.cgstAmount()));
        c.setSgstAmount(nz(x.sgstAmount()));
        c.setIgstAmount(nz(x.igstAmount()));
        c.setGstAmount(nz(x.cgstAmount()).add(nz(x.sgstAmount())).add(nz(x.igstAmount())));
        c.setVendorGstin(x.vendorGstin());
        if (x.paymentMode() != null) {
            c.setPaymentMode(x.paymentMode());
        }
        if (x.suggestedCategory() != null && categories.existsById(x.suggestedCategory())) {
            c.setCategoryCode(x.suggestedCategory());
        }
        if (x.description() != null && c.getDescription() == null) {
            c.setDescription(x.description());
        }
    }

    private void requireEditable(CompanyAccess access, ExpenseClaim claim) {
        boolean owner = access.isMember() && claim.getEmployee().getId().equals(access.membershipId());
        if (!owner && access.role() != Role.ADMIN && access.role() != Role.FINANCE) {
            throw ApiException.forbidden("Only the claimant, finance or an admin can change receipts");
        }
        if (claim.getStatus() != ClaimStatus.DRAFT) {
            throw ApiException.conflict("not_editable", "Receipts can only be added to draft claims");
        }
    }

    /** Content sniffing by magic bytes; the client-supplied Content-Type is not trusted. */
    static String detectType(byte[] b) {
        if (b.length >= 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        if (b.length >= 8 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') {
            return "image/png";
        }
        if (b.length >= 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F' && b[8] == 'W'
                && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
            return "image/webp";
        }
        if (b.length >= 5 && b[0] == '%' && b[1] == 'P' && b[2] == 'D' && b[3] == 'F' && b[4] == '-') {
            return "application/pdf";
        }
        return null;
    }

    static String safeFilename(String name) {
        if (name == null || name.isBlank()) {
            return "receipt";
        }
        String base = name.replace('\\', '/');
        base = base.substring(base.lastIndexOf('/') + 1);
        base = base.replaceAll("[^A-Za-z0-9._ -]", "_");
        return base.length() > 200 ? base.substring(0, 200) : base;
    }

    private String toJson(ReceiptExtraction x) {
        try {
            return objectMapper.writeValueAsString(x);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    private static BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO.setScale(2) : v;
    }

    public record ReceiptFile(String filename, String contentType, byte[] content) {
    }
}
