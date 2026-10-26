package com.hisabloop.reimbursement;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hisabloop.audit.AuditService;
import com.hisabloop.claim.ClaimDtos;
import com.hisabloop.claim.ClaimFilter;
import com.hisabloop.claim.ClaimMapper;
import com.hisabloop.claim.ClaimRepository;
import com.hisabloop.claim.ClaimService;
import com.hisabloop.claim.ClaimSpecifications;
import com.hisabloop.claim.ClaimStatus;
import com.hisabloop.claim.ExpenseClaim;
import com.hisabloop.common.error.ApiException;
import com.hisabloop.common.util.Csv;
import com.hisabloop.company.Company;
import com.hisabloop.company.CompanyAccess;
import com.hisabloop.company.CompanyAccessService;
import com.hisabloop.company.CompanyRepository;
import com.hisabloop.company.Membership;
import com.hisabloop.company.Permission;
import com.hisabloop.integration.ClaimMessenger;
import com.hisabloop.user.User;
import com.hisabloop.user.UserRepository;

/**
 * Groups approved claims into reimbursement batches and records payments made outside the
 * system. Creating a batch or a bank file never transfers money.
 */
@Service
public class ReimbursementService {

    public static final String ENTITY = "BATCH";

    /** Documented in docs/API_SPECIFICATION.md (bank file format). */
    public static final List<String> BANK_FILE_COLUMNS = List.of("batch_reference", "employee_name",
            "employee_email", "employee_phone", "team", "claim_count", "amount_inr", "claim_references", "narration");

    private final CompanyAccessService accessService;
    private final CompanyRepository companies;
    private final ClaimRepository claims;
    private final ReimbursementBatchRepository batches;
    private final ReimbursementBatchItemRepository items;
    private final PaymentRecordRepository payments;
    private final UserRepository users;
    private final AuditService audit;
    private final ClaimMessenger messenger;
    private final Clock clock;

    public ReimbursementService(CompanyAccessService accessService, CompanyRepository companies,
            ClaimRepository claims, ReimbursementBatchRepository batches, ReimbursementBatchItemRepository items,
            PaymentRecordRepository payments, UserRepository users, AuditService audit, ClaimMessenger messenger,
            Clock clock) {
        this.accessService = accessService;
        this.companies = companies;
        this.claims = claims;
        this.batches = batches;
        this.items = items;
        this.payments = payments;
        this.users = users;
        this.audit = audit;
        this.messenger = messenger;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<ReimbursementDtos.BatchSummary> list(String companyId) {
        accessService.require(companyId, Permission.VIEW_REIMBURSEMENTS);
        List<ReimbursementBatch> all = batches.findByCompanyIdOrderByBatchNumberDesc(companyId);
        Map<String, String> names = userNames(all.stream().map(ReimbursementBatch::getCreatedByUserId).toList());
        return all.stream().map(b -> summary(b, names, items.findByBatchId(b.getId()))).toList();
    }

    @Transactional(readOnly = true)
    public ReimbursementDtos.EligibleClaims eligible(String companyId) {
        CompanyAccess access = accessService.require(companyId, Permission.MANAGE_REIMBURSEMENTS);
        List<ExpenseClaim> approved = claims.findAll(ClaimSpecifications.build(access,
                new ClaimFilter(null, List.of(ClaimStatus.APPROVED), null, null, null, null, null, false, null)));
        List<ExpenseClaim> eligible = approved.stream().filter(c -> c.getBatchId() == null)
                .sorted(Comparator.comparing(ExpenseClaim::getClaimNumber)).toList();
        BigDecimal total = eligible.stream().map(ExpenseClaim::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new ReimbursementDtos.EligibleClaims(eligible.stream().map(ClaimMapper::summary).toList(), total);
    }

    @Transactional
    public ReimbursementDtos.BatchDetail create(String companyId, ReimbursementDtos.CreateBatchRequest req) {
        CompanyAccess access = accessService.require(companyId, Permission.MANAGE_REIMBURSEMENTS);
        Set<String> ids = new LinkedHashSet<>(req.claimIds());
        Company company = companies.findByIdForUpdate(companyId).orElseThrow(() -> ApiException.notFound("Company"));

        List<ExpenseClaim> selected = claims.findAllForUpdate(companyId, ids);
        if (selected.size() != ids.size()) {
            throw ApiException.notFound("One or more claims");
        }
        List<String> ineligible = selected.stream()
                .filter(c -> c.getStatus() != ClaimStatus.APPROVED || c.getBatchId() != null)
                .map(c -> c.getReference() + " (" + c.getStatus() + ")")
                .toList();
        if (!ineligible.isEmpty()) {
            throw ApiException.conflict("ineligible_claims",
                    "Only approved claims that are not already in a batch can be added: " + String.join(", ", ineligible));
        }
        if (items.existsByClaimIdIn(ids)) {
            throw ApiException.conflict("already_batched", "One or more claims are already in a batch");
        }

        ReimbursementBatch batch = new ReimbursementBatch();
        batch.setCompanyId(companyId);
        batch.setBatchNumber(company.takeNextBatchNumber());
        batch.setStatus(ReimbursementBatch.CREATED);
        batch.setCreatedByUserId(access.userId());
        batch.setNotes(req.notes() == null || req.notes().isBlank() ? null : req.notes().trim());
        BigDecimal total = selected.stream().map(ExpenseClaim::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        batch.setTotalAmount(total);
        batch.setClaimCount(selected.size());
        batches.saveAndFlush(batch);

        List<ReimbursementBatchItem> newItems = new ArrayList<>();
        for (ExpenseClaim c : selected) {
            ReimbursementBatchItem item = new ReimbursementBatchItem();
            item.setCompanyId(companyId);
            item.setBatchId(batch.getId());
            item.setClaimId(c.getId());
            item.setEmployeeMembershipId(c.getEmployee().getId());
            item.setAmount(c.getTotalAmount());
            newItems.add(item);

            ClaimStatus previous = c.transitionTo(ClaimStatus.IN_BATCH);
            c.setBatchId(batch.getId());
            audit.record(companyId, ClaimService.ENTITY, c.getId(), c.getReference(), "CLAIM_BATCHED",
                    ClaimService.actor(access), previous.name(), c.getStatus().name(),
                    Map.of("batch", batch.getReference()));
        }
        items.saveAll(newItems);

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("claimCount", selected.size());
        meta.put("totalAmount", total.toPlainString());
        audit.record(companyId, ENTITY, batch.getId(), batch.getReference(), "BATCH_CREATED",
                ClaimService.actor(access), null, batch.getStatus(), meta);
        return detail(batch);
    }

    @Transactional(readOnly = true)
    public ReimbursementDtos.BatchDetail get(String companyId, String batchId) {
        accessService.require(companyId, Permission.VIEW_REIMBURSEMENTS);
        ReimbursementBatch batch = batches.findByIdAndCompanyId(batchId, companyId)
                .orElseThrow(() -> ApiException.notFound("Batch"));
        return detail(batch);
    }

    @Transactional
    public ReimbursementDtos.BatchDetail markPaid(String companyId, String batchId,
            ReimbursementDtos.MarkPaidRequest req) {
        CompanyAccess access = accessService.require(companyId, Permission.MANAGE_REIMBURSEMENTS);
        ReimbursementBatch batch = batches.findForUpdate(batchId, companyId)
                .orElseThrow(() -> ApiException.notFound("Batch"));
        if (!ReimbursementBatch.CREATED.equals(batch.getStatus())) {
            throw ApiException.conflict("already_paid", "Batch " + batch.getReference() + " is already marked as paid");
        }
        if (payments.findByBatchId(batch.getId()).isPresent()) {
            throw ApiException.conflict("already_paid", "A payment is already recorded for this batch");
        }
        List<String> claimIds = items.findByBatchId(batch.getId()).stream().map(ReimbursementBatchItem::getClaimId)
                .toList();
        List<ExpenseClaim> batchClaims = claims.findAllForUpdate(companyId, claimIds);
        for (ExpenseClaim c : batchClaims) {
            if (c.getStatus() != ClaimStatus.IN_BATCH || !batch.getId().equals(c.getBatchId())) {
                throw ApiException.conflict("invalid_transition",
                        "Claim " + c.getReference() + " is " + c.getStatus() + "; cannot mark batch paid");
            }
        }
        var now = clock.instant();
        for (ExpenseClaim c : batchClaims) {
            ClaimStatus previous = c.transitionTo(ClaimStatus.PAID);
            c.setPaidAt(now);
            audit.record(companyId, ClaimService.ENTITY, c.getId(), c.getReference(), "CLAIM_PAID",
                    ClaimService.actor(access), previous.name(), c.getStatus().name(),
                    Map.of("batch", batch.getReference(), "method", req.method()));
            messenger.paid(c, req.method(), req.reference().trim());
        }

        PaymentRecord p = new PaymentRecord();
        p.setCompanyId(companyId);
        p.setBatchId(batch.getId());
        p.setMethod(req.method());
        p.setReference(req.reference().trim());
        p.setAmount(batch.getTotalAmount());
        p.setPaidOn(req.paidOn());
        p.setRecordedByUserId(access.userId());
        p.setCreatedAt(now);
        payments.save(p);

        String previous = batch.getStatus();
        batch.setStatus(ReimbursementBatch.PAID);
        batch.setPaidAt(now);
        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("method", req.method());
        meta.put("reference", req.reference().trim());
        meta.put("paidOn", req.paidOn().toString());
        meta.put("amount", batch.getTotalAmount().toPlainString());
        audit.record(companyId, ENTITY, batch.getId(), batch.getReference(), "BATCH_MARKED_PAID",
                ClaimService.actor(access), previous, batch.getStatus(), meta);
        return detail(batch);
    }

    /** One row per employee with the amount to transfer. Values are CSV-escaped. */
    @Transactional
    public BankFile bankFile(String companyId, String batchId) {
        CompanyAccess access = accessService.require(companyId, Permission.MANAGE_REIMBURSEMENTS);
        ReimbursementBatch batch = batches.findByIdAndCompanyId(batchId, companyId)
                .orElseThrow(() -> ApiException.notFound("Batch"));
        List<ExpenseClaim> batchClaims = claims.findByBatchIdOrderByClaimNumber(batch.getId());
        StringBuilder csv = new StringBuilder();
        csv.append(Csv.row(BANK_FILE_COLUMNS));
        Map<Membership, List<ExpenseClaim>> byEmployee = groupByEmployee(batchClaims);
        for (Map.Entry<Membership, List<ExpenseClaim>> e : byEmployee.entrySet()) {
            Membership m = e.getKey();
            BigDecimal amount = e.getValue().stream().map(ExpenseClaim::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            String refs = e.getValue().stream().map(ExpenseClaim::getReference).collect(Collectors.joining(" "));
            csv.append(Csv.row(List.of(batch.getReference(), m.getUser().getFullName(), m.getUser().getEmail(),
                    m.getUser().getPhone() == null ? "" : m.getUser().getPhone(),
                    m.getTeam() == null ? "" : m.getTeam().getName(), e.getValue().size(), amount.toPlainString(),
                    refs, "HisabLoop reimbursement " + batch.getReference())));
        }
        audit.record(companyId, ENTITY, batch.getId(), batch.getReference(), "BANK_FILE_GENERATED",
                ClaimService.actor(access), batch.getStatus(), batch.getStatus(),
                Map.of("rows", byEmployee.size()));
        // UTF-8 BOM so Excel shows ₹ and Indian names correctly.
        byte[] body = ("﻿" + csv).getBytes(StandardCharsets.UTF_8);
        return new BankFile("hisabloop-" + batch.getReference() + "-bank-file.csv", body);
    }

    public ReimbursementDtos.PayoutCapabilities capabilities() {
        return new ReimbursementDtos.PayoutCapabilities(false,
                "UPI payouts are not available: no regulated payment provider is configured. "
                        + "Pay through your bank using the bank file, then mark the batch as paid.");
    }

    // ---------------------------------------------------------------- helpers

    private ReimbursementDtos.BatchDetail detail(ReimbursementBatch batch) {
        List<ExpenseClaim> batchClaims = claims.findByBatchIdOrderByClaimNumber(batch.getId());
        Map<String, String> names = userNames(List.of(batch.getCreatedByUserId()));
        List<ReimbursementDtos.EmployeeTotal> employees = groupByEmployee(batchClaims).entrySet().stream()
                .map(e -> new ReimbursementDtos.EmployeeTotal(e.getKey().getId(), e.getKey().getUser().getFullName(),
                        e.getKey().getTeam() == null ? null : e.getKey().getTeam().getName(), e.getValue().size(),
                        e.getValue().stream().map(ExpenseClaim::getTotalAmount).reduce(BigDecimal.ZERO,
                                BigDecimal::add)))
                .toList();
        ReimbursementDtos.PaymentDto payment = payments.findByBatchId(batch.getId())
                .map(p -> new ReimbursementDtos.PaymentDto(p.getMethod(), p.getReference(), p.getAmount(),
                        p.getPaidOn(), userNames(List.of(p.getRecordedByUserId())).get(p.getRecordedByUserId()),
                        p.getCreatedAt()))
                .orElse(null);
        return new ReimbursementDtos.BatchDetail(
                summary(batch, names, items.findByBatchId(batch.getId())),
                employees,
                batchClaims.stream().map(ClaimMapper::summary).toList(),
                payment);
    }

    private ReimbursementDtos.BatchSummary summary(ReimbursementBatch b, Map<String, String> names,
            List<ReimbursementBatchItem> batchItems) {
        int employees = (int) batchItems.stream().map(ReimbursementBatchItem::getEmployeeMembershipId).distinct()
                .count();
        return new ReimbursementDtos.BatchSummary(b.getId(), b.getReference(), b.getStatus(), b.getTotalAmount(),
                b.getClaimCount(), employees, names.get(b.getCreatedByUserId()), b.getCreatedAt(), b.getPaidAt(),
                b.getNotes());
    }

    private static Map<Membership, List<ExpenseClaim>> groupByEmployee(List<ExpenseClaim> list) {
        Map<Membership, List<ExpenseClaim>> map = new LinkedHashMap<>();
        list.stream()
                .sorted(Comparator.comparing((ExpenseClaim c) -> c.getEmployee().getUser().getFullName()))
                .forEach(c -> map.computeIfAbsent(c.getEmployee(), k -> new ArrayList<>()).add(c));
        return map;
    }

    private Map<String, String> userNames(List<String> ids) {
        return users.findAllById(new LinkedHashSet<>(ids)).stream()
                .collect(Collectors.toMap(User::getId, User::getFullName, (a, b) -> a));
    }

    public record BankFile(String filename, byte[] content) {
    }
}
