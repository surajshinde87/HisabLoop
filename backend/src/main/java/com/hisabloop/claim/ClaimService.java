package com.hisabloop.claim;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hisabloop.approval.ApprovalRules;
import com.hisabloop.audit.AuditActor;
import com.hisabloop.audit.AuditService;
import com.hisabloop.common.error.ApiException;
import com.hisabloop.company.Company;
import com.hisabloop.company.CompanyAccess;
import com.hisabloop.company.CompanyAccessService;
import com.hisabloop.company.CompanyRepository;
import com.hisabloop.company.Permission;
import com.hisabloop.company.Role;
import com.hisabloop.integration.ClaimMessenger;
import com.hisabloop.policy.ExpenseCategoryRepository;
import com.hisabloop.policy.ExpensePolicy;
import com.hisabloop.policy.ExpensePolicyRepository;
import com.hisabloop.policy.PolicyDefaults;
import com.hisabloop.policy.PolicyEvaluator;
import com.hisabloop.receipt.ProcessingStatus;
import com.hisabloop.receipt.ReceiptRepository;

/** Claim creation, editing and the employee-side transitions (confirm, submit). */
@Service
public class ClaimService {

    public static final ZoneId INDIA = ZoneId.of("Asia/Kolkata");
    public static final String ENTITY = "CLAIM";

    private final CompanyAccessService accessService;
    private final ClaimRepository claims;
    private final CompanyRepository companies;
    private final ExpenseCategoryRepository categories;
    private final ExpensePolicyRepository policies;
    private final PolicyEvaluator policyEvaluator;
    private final ReceiptRepository receipts;
    private final ClaimCommentRepository comments;
    private final AuditService audit;
    private final ClaimQueryService queries;
    private final ClaimMessenger messenger;
    private final Clock clock;

    public ClaimService(CompanyAccessService accessService, ClaimRepository claims, CompanyRepository companies,
            ExpenseCategoryRepository categories, ExpensePolicyRepository policies, PolicyEvaluator policyEvaluator,
            ReceiptRepository receipts, ClaimCommentRepository comments, AuditService audit,
            ClaimQueryService queries, ClaimMessenger messenger, Clock clock) {
        this.accessService = accessService;
        this.claims = claims;
        this.companies = companies;
        this.categories = categories;
        this.policies = policies;
        this.policyEvaluator = policyEvaluator;
        this.receipts = receipts;
        this.comments = comments;
        this.audit = audit;
        this.queries = queries;
        this.messenger = messenger;
        this.clock = clock;
    }

    @Transactional
    public ClaimDtos.ClaimDetail create(String companyId, ClaimDtos.CreateClaimRequest req) {
        CompanyAccess access = requireMember(companyId, Permission.CREATE_CLAIM);
        requireCategory(req.categoryCode());

        ExpenseClaim claim = newClaim(access, "WHATSAPP".equals(req.source()) ? ClaimSource.WHATSAPP : ClaimSource.WEB);
        claim.setCategoryCode(req.categoryCode());
        claim.setVendorName(trimToNull(req.vendorName()));
        claim.setReceiptDate(req.receiptDate());
        claim.setTotalAmount(money(req.totalAmount() == null ? BigDecimal.ZERO : req.totalAmount()));
        claim.setTaxableAmount(req.taxableAmount() == null ? null : money(req.taxableAmount()));
        claim.setCgstAmount(moneyOrZero(req.cgstAmount()));
        claim.setSgstAmount(moneyOrZero(req.sgstAmount()));
        claim.setIgstAmount(moneyOrZero(req.igstAmount()));
        claim.setVendorGstin(req.vendorGstin());
        claim.setPaymentMode(trimToNull(req.paymentMode()));
        claim.setDescription(trimToNull(req.description()));
        recomputeGst(claim);
        validateAmounts(claim);

        claims.saveAndFlush(claim);
        policyEvaluator.evaluate(claim);
        audit.record(companyId, ENTITY, claim.getId(), claim.getReference(), "CLAIM_CREATED", actor(access), null,
                claim.getStatus().name(), Map.of("source", claim.getSource().name()));
        return queries.detail(access, claim);
    }

    /** Receipt-less claim from free text, e.g. "Auto fare 180 cash". Always starts as DRAFT. */
    @Transactional
    public ClaimDtos.ClaimDetail createFromText(String companyId, ClaimDtos.TextClaimRequest req) {
        CompanyAccess access = requireMember(companyId, Permission.CREATE_CLAIM);
        TextClaimParser.Parsed parsed = TextClaimParser.parse(req.text());

        ExpenseClaim claim = newClaim(access, ClaimSource.TEXT);
        claim.setRawText(req.text().trim());
        claim.setDescription(parsed.description());
        claim.setCategoryCode(parsed.categoryCode());
        claim.setTotalAmount(parsed.amount() == null ? money(BigDecimal.ZERO) : money(parsed.amount()));
        claim.setPaymentMode(parsed.paymentMode());
        claim.setReceiptDate(LocalDate.now(clock.withZone(INDIA)));
        claim.setHasReceipt(false);
        recomputeGst(claim);

        claims.saveAndFlush(claim);
        policyEvaluator.evaluate(claim);
        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("source", "TEXT");
        meta.put("channel", req.channel() == null ? "WEB" : req.channel());
        audit.record(companyId, ENTITY, claim.getId(), claim.getReference(), "CLAIM_CREATED", actor(access), null,
                claim.getStatus().name(), meta);
        return queries.detail(access, claim);
    }

    @Transactional
    public ClaimDtos.ClaimDetail update(String companyId, String claimId, ClaimDtos.UpdateClaimRequest req) {
        CompanyAccess access = accessService.require(companyId, Permission.VIEW_CLAIMS);
        ExpenseClaim claim = lockVisible(access, claimId);
        requireEditor(access, claim);
        if (!claim.getStatus().isEditable()) {
            throw ApiException.conflict("not_editable", "Only draft or confirmed claims can be edited");
        }
        if (!Objects.equals(req.version(), claim.getVersion())) {
            throw ApiException.conflict("concurrent_update",
                    "This claim was changed by someone else. Refresh and try again.");
        }

        List<String> changed = new ArrayList<>();
        if (req.categoryCode() != null && !req.categoryCode().equals(claim.getCategoryCode())) {
            requireCategory(req.categoryCode());
            claim.setCategoryCode(req.categoryCode());
            changed.add("category");
        }
        if (req.vendorName() != null && !Objects.equals(trimToNull(req.vendorName()), claim.getVendorName())) {
            claim.setVendorName(trimToNull(req.vendorName()));
            changed.add("vendorName");
        }
        if (req.receiptDate() != null && !req.receiptDate().equals(claim.getReceiptDate())) {
            claim.setReceiptDate(req.receiptDate());
            changed.add("receiptDate");
        }
        if (req.totalAmount() != null && money(req.totalAmount()).compareTo(claim.getTotalAmount()) != 0) {
            claim.setTotalAmount(money(req.totalAmount()));
            changed.add("totalAmount");
        }
        if (req.taxableAmount() != null) {
            claim.setTaxableAmount(money(req.taxableAmount()));
            changed.add("taxableAmount");
        }
        if (req.cgstAmount() != null) {
            claim.setCgstAmount(money(req.cgstAmount()));
            changed.add("cgst");
        }
        if (req.sgstAmount() != null) {
            claim.setSgstAmount(money(req.sgstAmount()));
            changed.add("sgst");
        }
        if (req.igstAmount() != null) {
            claim.setIgstAmount(money(req.igstAmount()));
            changed.add("igst");
        }
        if (req.vendorGstin() != null) {
            claim.setVendorGstin(req.vendorGstin().isBlank() ? null : req.vendorGstin());
            changed.add("vendorGstin");
        }
        if (req.paymentMode() != null) {
            claim.setPaymentMode(trimToNull(req.paymentMode()));
            changed.add("paymentMode");
        }
        if (req.description() != null) {
            claim.setDescription(trimToNull(req.description()));
            changed.add("description");
        }
        recomputeGst(claim);
        validateAmounts(claim);

        if (changed.isEmpty()) {
            return queries.detail(access, claim);
        }
        if (claim.getStatus() == ClaimStatus.CONFIRMED) {
            // Editing a confirmed claim sends it back for re-confirmation.
            ClaimStatus previous = claim.transitionTo(ClaimStatus.DRAFT);
            claim.setConfirmedAt(null);
            audit.record(companyId, ENTITY, claim.getId(), claim.getReference(), "CLAIM_REOPENED", actor(access),
                    previous.name(), ClaimStatus.DRAFT.name(), Map.of("reason", "edited after confirmation"));
        }
        policyEvaluator.evaluate(claim);
        audit.record(companyId, ENTITY, claim.getId(), claim.getReference(), "CLAIM_UPDATED", actor(access),
                claim.getStatus().name(), claim.getStatus().name(), Map.of("fields", changed));
        return queries.detail(access, claim);
    }

    @Transactional
    public ClaimDtos.ClaimDetail confirm(String companyId, String claimId) {
        CompanyAccess access = accessService.require(companyId, Permission.VIEW_CLAIMS);
        ExpenseClaim claim = lockVisible(access, claimId);
        requireOwnerOrAdmin(access, claim);
        if (claim.getStatus() != ClaimStatus.DRAFT) {
            throw ApiException.conflict("invalid_transition", "Only draft claims can be confirmed");
        }
        List<String> missing = new ArrayList<>();
        if (claim.getTotalAmount() == null || claim.getTotalAmount().signum() <= 0) {
            missing.add("totalAmount");
        }
        if (claim.getReceiptDate() == null) {
            missing.add("receiptDate");
        }
        if (claim.getVendorName() == null && claim.getDescription() == null) {
            missing.add("vendorName");
        }
        if (!missing.isEmpty()) {
            throw ApiException.unprocessable("incomplete_claim",
                    "Complete these fields before confirming: " + String.join(", ", missing));
        }
        boolean processing = receipts.findByClaimIdOrderByCreatedAtAsc(claim.getId()).stream()
                .anyMatch(r -> r.getProcessingStatus() == ProcessingStatus.PROCESSING);
        if (processing) {
            throw ApiException.conflict("receipt_processing", "Wait for receipt processing to finish");
        }
        ClaimStatus previous = claim.transitionTo(ClaimStatus.CONFIRMED);
        claim.setConfirmedAt(clock.instant());
        policyEvaluator.evaluate(claim);
        audit.record(companyId, ENTITY, claim.getId(), claim.getReference(), "CLAIM_CONFIRMED", actor(access),
                previous.name(), claim.getStatus().name(), null);
        return queries.detail(access, claim);
    }

    @Transactional
    public ClaimDtos.ClaimDetail submit(String companyId, String claimId) {
        CompanyAccess access = accessService.require(companyId, Permission.VIEW_CLAIMS);
        ExpenseClaim claim = lockVisible(access, claimId);
        requireOwnerOrAdmin(access, claim);
        if (claim.getStatus() != ClaimStatus.CONFIRMED) {
            throw ApiException.conflict("invalid_transition", "Only confirmed claims can be submitted for approval");
        }
        ExpensePolicy policy = policies.findByCompanyId(companyId).orElseGet(() -> PolicyDefaults.policy(companyId));
        claim.setRequiredApprovalLevels(ApprovalRules.requiredLevels(claim.getTotalAmount(),
                policy.getTwoLevelApprovalAbove()));
        claim.setApprovalsCompleted(0);
        claim.setClarificationRequested(false);
        ClaimStatus previous = claim.transitionTo(ClaimStatus.PENDING_APPROVAL);
        claim.setSubmittedAt(clock.instant());
        policyEvaluator.evaluate(claim);
        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("requiredApprovalLevels", claim.getRequiredApprovalLevels());
        meta.put("approver", queries.expectedApproverName(claim));
        audit.record(companyId, ENTITY, claim.getId(), claim.getReference(), "CLAIM_SUBMITTED", actor(access),
                previous.name(), claim.getStatus().name(), meta);
        var manager = claim.getEmployee().getManager();
        messenger.submitted(claim, queries.expectedApproverName(claim),
                manager != null && manager.isActive() ? manager : null);
        return queries.detail(access, claim);
    }

    @Transactional
    public ClaimDtos.ClaimDetail addComment(String companyId, String claimId, ClaimDtos.CommentRequest req) {
        CompanyAccess access = accessService.require(companyId, Permission.VIEW_CLAIMS);
        ExpenseClaim claim = lockVisible(access, claimId);
        String kind = req.kind() == null ? ClaimComment.COMMENT : req.kind();
        boolean owner = access.isMember() && claim.getEmployee().getId().equals(access.membershipId());

        if (ClaimComment.CLARIFICATION_REQUEST.equals(kind)) {
            List<String> prior = queries.priorApproverIds(claim);
            if (!ApprovalRules.canDecide(access, claim, prior)) {
                throw ApiException.forbidden("Only the current approver can request clarification");
            }
            claim.setClarificationRequested(true);
        } else if (ClaimComment.CLARIFICATION_RESPONSE.equals(kind)) {
            if (!owner) {
                throw ApiException.forbidden("Only the claimant can answer a clarification request");
            }
            claim.setClarificationRequested(false);
        }

        ClaimComment c = new ClaimComment();
        c.setCompanyId(companyId);
        c.setClaimId(claim.getId());
        c.setAuthorUserId(access.userId());
        c.setKind(kind);
        c.setBody(req.body().trim());
        c.setCreatedAt(clock.instant());
        comments.save(c);
        claim.setUpdatedAt(clock.instant());
        audit.record(companyId, ENTITY, claim.getId(), claim.getReference(), "COMMENT_ADDED", actor(access),
                claim.getStatus().name(), claim.getStatus().name(), Map.of("kind", kind));
        return queries.detail(access, claim);
    }

    @Transactional
    public ClaimDtos.ClaimDetail resolveDuplicate(String companyId, String claimId,
            ClaimDtos.DuplicateResolutionRequest req) {
        CompanyAccess access = accessService.require(companyId, Permission.VIEW_CLAIMS);
        ExpenseClaim claim = lockVisible(access, claimId);
        boolean reviewer = access.role() == Role.ADMIN || access.role() == Role.FINANCE
                || ApprovalRules.canDecide(access, claim, queries.priorApproverIds(claim));
        if (!reviewer) {
            throw ApiException.forbidden("Only an approver, finance or an admin can resolve duplicate warnings");
        }
        if (claim.getDuplicateStatus() != DuplicateStatus.SUSPECTED) {
            throw ApiException.conflict("no_duplicate_warning", "This claim has no open duplicate warning");
        }
        DuplicateStatus resolved = req.duplicate() ? DuplicateStatus.CONFIRMED_DUPLICATE : DuplicateStatus.NOT_DUPLICATE;
        claim.setDuplicateStatus(resolved);
        policyEvaluator.evaluate(claim);
        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("resolution", resolved.name());
        if (req.note() != null && !req.note().isBlank()) {
            meta.put("note", req.note().trim());
        }
        audit.record(companyId, ENTITY, claim.getId(), claim.getReference(), "DUPLICATE_RESOLVED", actor(access),
                claim.getStatus().name(), claim.getStatus().name(), meta);
        return queries.detail(access, claim);
    }

    @Transactional
    public ClaimDtos.ClaimDetail reviewItc(String companyId, String claimId, ClaimDtos.ItcReviewRequest req) {
        CompanyAccess access = accessService.require(companyId, Permission.REVIEW_ITC);
        ExpenseClaim claim = lockVisible(access, claimId);
        if (claim.getStatus() == ClaimStatus.DRAFT) {
            throw ApiException.conflict("not_reviewable", "Draft claims cannot be reviewed for ITC");
        }
        String previous = claim.getItcStatus().name();
        claim.setItcStatus(req.status());
        claim.setItcNote(trimToNull(req.note()));
        audit.record(companyId, ENTITY, claim.getId(), claim.getReference(), "ITC_REVIEWED", actor(access), previous,
                req.status().name(), req.note() == null ? null : Map.of("note", req.note().trim()));
        return queries.detail(access, claim);
    }

    // ---------------------------------------------------------------- helpers

    private ExpenseClaim newClaim(CompanyAccess access, ClaimSource source) {
        Company company = companies.findByIdForUpdate(access.companyId())
                .orElseThrow(() -> ApiException.notFound("Company"));
        ExpenseClaim claim = new ExpenseClaim();
        claim.setCompanyId(company.getId());
        claim.setClaimNumber(company.takeNextClaimNumber());
        claim.setEmployee(access.membership());
        claim.setSource(source);
        claim.setStatus(ClaimStatus.DRAFT);
        return claim;
    }

    ExpenseClaim lockVisible(CompanyAccess access, String claimId) {
        ExpenseClaim claim = claims.findForUpdate(claimId, access.companyId())
                .orElseThrow(() -> ApiException.notFound("Claim"));
        queries.ensureVisible(access, claim);
        return claim;
    }

    private CompanyAccess requireMember(String companyId, Permission permission) {
        CompanyAccess access = accessService.require(companyId, permission);
        if (!access.isMember()) {
            throw ApiException.forbidden("Only company members can create claims");
        }
        return access;
    }

    private void requireEditor(CompanyAccess access, ExpenseClaim claim) {
        boolean owner = access.isMember() && claim.getEmployee().getId().equals(access.membershipId());
        if (!owner && access.role() != Role.ADMIN && access.role() != Role.FINANCE) {
            throw ApiException.forbidden("Only the claimant, finance or an admin can edit this claim");
        }
    }

    private void requireOwnerOrAdmin(CompanyAccess access, ExpenseClaim claim) {
        boolean owner = access.isMember() && claim.getEmployee().getId().equals(access.membershipId());
        if (!owner && access.role() != Role.ADMIN) {
            throw ApiException.forbidden("Only the claimant or an admin can do this");
        }
    }

    private void requireCategory(String code) {
        if (code == null || !categories.existsById(code)) {
            throw ApiException.badRequest("invalid_category", "Unknown expense category");
        }
    }

    static void recomputeGst(ExpenseClaim c) {
        BigDecimal gst = moneyOrZero(c.getCgstAmount()).add(moneyOrZero(c.getSgstAmount()))
                .add(moneyOrZero(c.getIgstAmount()));
        c.setGstAmount(gst);
    }

    static void validateAmounts(ExpenseClaim c) {
        if (c.getGstAmount().compareTo(c.getTotalAmount()) > 0) {
            throw ApiException.unprocessable("invalid_amounts", "GST cannot exceed the claim total");
        }
        if (c.getIgstAmount().signum() > 0 && (c.getCgstAmount().signum() > 0 || c.getSgstAmount().signum() > 0)) {
            throw ApiException.unprocessable("invalid_amounts",
                    "A receipt has either IGST (inter-state) or CGST+SGST (intra-state), not both");
        }
        if (c.getTaxableAmount() != null && c.getTaxableAmount().compareTo(c.getTotalAmount()) > 0) {
            throw ApiException.unprocessable("invalid_amounts", "Taxable value cannot exceed the claim total");
        }
    }

    static BigDecimal money(BigDecimal v) {
        return v.setScale(2, RoundingMode.HALF_UP);
    }

    static BigDecimal moneyOrZero(BigDecimal v) {
        return v == null ? BigDecimal.ZERO.setScale(2) : money(v);
    }

    static String trimToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    public static AuditActor actor(CompanyAccess access) {
        return new AuditActor(access.userId(), access.userName());
    }
}
