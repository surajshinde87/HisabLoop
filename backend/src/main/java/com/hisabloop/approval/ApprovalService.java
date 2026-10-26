package com.hisabloop.approval;

import java.time.Clock;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import com.hisabloop.audit.AuditService;
import com.hisabloop.claim.ClaimComment;
import com.hisabloop.claim.ClaimCommentRepository;
import com.hisabloop.claim.ClaimDtos;
import com.hisabloop.claim.ClaimMapper;
import com.hisabloop.claim.ClaimQueryService;
import com.hisabloop.claim.ClaimRepository;
import com.hisabloop.claim.ClaimService;
import com.hisabloop.claim.ClaimStatus;
import com.hisabloop.claim.DuplicateStatus;
import com.hisabloop.claim.ExpenseClaim;
import com.hisabloop.common.error.ApiException;
import com.hisabloop.company.CompanyAccess;
import com.hisabloop.company.CompanyAccessService;
import com.hisabloop.company.Permission;
import com.hisabloop.integration.ClaimMessenger;
import com.hisabloop.policy.CheckResult;
import com.hisabloop.policy.ClaimPolicyCheck;
import com.hisabloop.policy.ClaimPolicyCheckRepository;
import com.hisabloop.policy.PolicyEvaluator;
import com.hisabloop.receipt.ReceiptRepository;

@Service
public class ApprovalService {

    private final CompanyAccessService accessService;
    private final ClaimRepository claims;
    private final ClaimQueryService queries;
    private final ApprovalRepository approvals;
    private final ClaimCommentRepository comments;
    private final ClaimPolicyCheckRepository checks;
    private final PolicyEvaluator policyEvaluator;
    private final ReceiptRepository receipts;
    private final AuditService audit;
    private final ClaimMessenger messenger;
    private final TransactionTemplate tx;
    private final Clock clock;

    public ApprovalService(CompanyAccessService accessService, ClaimRepository claims, ClaimQueryService queries,
            ApprovalRepository approvals, ClaimCommentRepository comments, ClaimPolicyCheckRepository checks,
            PolicyEvaluator policyEvaluator, ReceiptRepository receipts, AuditService audit,
            ClaimMessenger messenger, PlatformTransactionManager transactionManager, Clock clock) {
        this.accessService = accessService;
        this.claims = claims;
        this.queries = queries;
        this.approvals = approvals;
        this.comments = comments;
        this.checks = checks;
        this.policyEvaluator = policyEvaluator;
        this.receipts = receipts;
        this.audit = audit;
        this.messenger = messenger;
        this.tx = new TransactionTemplate(transactionManager);
        this.clock = clock;
    }

    /** Claims waiting for a decision that the caller is allowed to make. */
    @Transactional(readOnly = true)
    public List<ApprovalDtos.PendingApproval> inbox(String companyId) {
        CompanyAccess access = accessService.require(companyId, Permission.APPROVE_CLAIMS);
        List<ApprovalDtos.PendingApproval> items = new ArrayList<>();
        for (ExpenseClaim c : claims.findByCompanyAndStatus(companyId, ClaimStatus.PENDING_APPROVAL)) {
            if (!ApprovalRules.canDecide(access, c, queries.priorApproverIds(c))) {
                continue;
            }
            List<ClaimPolicyCheck> claimChecks = checks.findByClaimIdOrderByCheckType(c.getId());
            List<ClaimDtos.PolicyCheckDto> issues = claimChecks.stream()
                    .filter(k -> k.getResult() != CheckResult.PASS)
                    .map(k -> new ClaimDtos.PolicyCheckDto(k.getCheckType().name(), k.getResult().name(),
                            k.isBlocking(), k.getMessage()))
                    .toList();
            String receiptId = receipts.findByClaimIdOrderByCreatedAtAsc(c.getId()).stream()
                    .findFirst().map(r -> r.getId()).orElse(null);
            items.add(new ApprovalDtos.PendingApproval(ClaimMapper.summary(c), c.getApprovalsCompleted() + 1,
                    c.getRequiredApprovalLevels(), issues, issues.stream().anyMatch(i -> i.blocking()), receiptId,
                    c.isClarificationRequested()));
        }
        return items;
    }

    @Transactional
    public ClaimDtos.ClaimDetail approve(String companyId, String claimId, ApprovalDtos.ApproveRequest req) {
        CompanyAccess access = accessService.require(companyId, Permission.APPROVE_CLAIMS);
        ExpenseClaim claim = lockDecidable(access, claimId);

        if (claim.getDuplicateStatus() == DuplicateStatus.CONFIRMED_DUPLICATE) {
            throw ApiException.conflict("confirmed_duplicate", "A confirmed duplicate cannot be approved; reject it");
        }
        // Re-evaluate so the decision is made against current data.
        List<ClaimPolicyCheck> current = policyEvaluator.evaluate(claim);
        List<String> blocking = current.stream().filter(ClaimPolicyCheck::isBlocking)
                .map(ClaimPolicyCheck::getMessage).toList();
        if (!blocking.isEmpty() && (req == null || !req.acknowledgeBlockingIssues())) {
            throw ApiException.unprocessable("blocking_issues",
                    "This claim has unresolved issues: " + String.join("; ", blocking)
                            + ". Review them and confirm to approve anyway.");
        }

        int level = claim.getApprovalsCompleted() + 1;
        saveDecision(access, claim, level, ApprovalDecision.APPROVED, req == null ? null : req.comment());
        claim.setApprovalsCompleted(level);

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("level", level);
        meta.put("requiredLevels", claim.getRequiredApprovalLevels());
        if (!blocking.isEmpty()) {
            meta.put("acknowledgedIssues", blocking);
        }
        if (level >= claim.getRequiredApprovalLevels()) {
            ClaimStatus previous = claim.transitionTo(ClaimStatus.APPROVED);
            claim.setApprovedAt(clock.instant());
            claim.setClarificationRequested(false);
            audit.record(companyId, ClaimService.ENTITY, claim.getId(), claim.getReference(), "CLAIM_APPROVED",
                    ClaimService.actor(access), previous.name(), claim.getStatus().name(), meta);
            messenger.approved(claim, true, access.userName());
        } else {
            audit.record(companyId, ClaimService.ENTITY, claim.getId(), claim.getReference(), "APPROVAL_LEVEL_RECORDED",
                    ClaimService.actor(access), claim.getStatus().name(), claim.getStatus().name(), meta);
            messenger.approved(claim, false, access.userName());
        }
        return queries.detail(access, claim);
    }

    @Transactional
    public ClaimDtos.ClaimDetail reject(String companyId, String claimId, ClaimDtos.ReasonRequest req) {
        CompanyAccess access = accessService.require(companyId, Permission.APPROVE_CLAIMS);
        ExpenseClaim claim = lockDecidable(access, claimId);
        String reason = req.reason().trim();
        int level = claim.getApprovalsCompleted() + 1;
        saveDecision(access, claim, level, ApprovalDecision.REJECTED, reason);
        ClaimStatus previous = claim.transitionTo(ClaimStatus.REJECTED);
        claim.setRejectedAt(clock.instant());
        claim.setRejectionReason(reason);
        claim.setClarificationRequested(false);
        audit.record(companyId, ClaimService.ENTITY, claim.getId(), claim.getReference(), "CLAIM_REJECTED",
                ClaimService.actor(access), previous.name(), claim.getStatus().name(),
                Map.of("level", level, "reason", reason));
        messenger.rejected(claim, access.userName(), reason);
        return queries.detail(access, claim);
    }

    /** Sends the claim back to the employee as a draft with the approver's reason. */
    @Transactional
    public ClaimDtos.ClaimDetail requestChanges(String companyId, String claimId, ClaimDtos.ReasonRequest req) {
        CompanyAccess access = accessService.require(companyId, Permission.APPROVE_CLAIMS);
        ExpenseClaim claim = lockDecidable(access, claimId);
        String reason = req.reason().trim();
        int level = claim.getApprovalsCompleted() + 1;
        saveDecision(access, claim, level, ApprovalDecision.CHANGES_REQUESTED, reason);
        ClaimStatus previous = claim.transitionTo(ClaimStatus.DRAFT);
        claim.setApprovalsCompleted(0);
        claim.setConfirmedAt(null);
        claim.setSubmittedAt(null);
        claim.setClarificationRequested(true);

        ClaimComment c = new ClaimComment();
        c.setCompanyId(companyId);
        c.setClaimId(claim.getId());
        c.setAuthorUserId(access.userId());
        c.setKind(ClaimComment.CLARIFICATION_REQUEST);
        c.setBody(reason);
        c.setCreatedAt(clock.instant());
        comments.save(c);

        audit.record(companyId, ClaimService.ENTITY, claim.getId(), claim.getReference(), "CHANGES_REQUESTED",
                ClaimService.actor(access), previous.name(), claim.getStatus().name(),
                Map.of("level", level, "reason", reason));
        messenger.changesRequested(claim, access.userName(), reason);
        return queries.detail(access, claim);
    }

    /**
     * Approves each eligible claim in its own transaction. Claims with blocking issues are skipped,
     * never approved implicitly. Returns one result per requested id.
     */
    public ApprovalDtos.BulkResult bulkApprove(String companyId, ApprovalDtos.BulkApproveRequest req) {
        List<ApprovalDtos.BulkItemResult> results = new ArrayList<>();
        int approved = 0;
        int skipped = 0;
        int failed = 0;
        for (String claimId : new LinkedHashSet<>(req.claimIds())) {
            try {
                ApprovalDtos.BulkItemResult r = tx.execute(status -> bulkOne(companyId, claimId, req.comment()));
                results.add(r);
                if ("SKIPPED".equals(r.outcome())) {
                    skipped++;
                } else {
                    approved++;
                }
            } catch (ApiException e) {
                failed++;
                results.add(new ApprovalDtos.BulkItemResult(claimId, null, "FAILED", e.getMessage()));
            } catch (RuntimeException e) {
                failed++;
                results.add(new ApprovalDtos.BulkItemResult(claimId, null, "FAILED", "Could not approve this claim"));
            }
        }
        return new ApprovalDtos.BulkResult(approved, skipped, failed, results);
    }

    private ApprovalDtos.BulkItemResult bulkOne(String companyId, String claimId, String comment) {
        CompanyAccess access = accessService.require(companyId, Permission.APPROVE_CLAIMS);
        ExpenseClaim claim = lockDecidable(access, claimId);
        List<ClaimPolicyCheck> current = policyEvaluator.evaluate(claim);
        List<String> blocking = current.stream().filter(ClaimPolicyCheck::isBlocking)
                .map(ClaimPolicyCheck::getMessage).toList();
        if (!blocking.isEmpty() || claim.getDuplicateStatus() == DuplicateStatus.CONFIRMED_DUPLICATE) {
            return new ApprovalDtos.BulkItemResult(claim.getId(), claim.getReference(), "SKIPPED",
                    "Needs individual review: " + String.join("; ", blocking));
        }
        approve(companyId, claimId, new ApprovalDtos.ApproveRequest(comment, false));
        ExpenseClaim after = claims.findById(claimId).orElseThrow();
        String outcome = after.getStatus() == ClaimStatus.APPROVED ? "APPROVED" : "LEVEL_APPROVED";
        String message = after.getStatus() == ClaimStatus.APPROVED ? "Approved"
                : "Level " + after.getApprovalsCompleted() + " of " + after.getRequiredApprovalLevels()
                        + " approved; awaiting admin approval";
        return new ApprovalDtos.BulkItemResult(claim.getId(), claim.getReference(), outcome, message);
    }

    private ExpenseClaim lockDecidable(CompanyAccess access, String claimId) {
        ExpenseClaim claim = claims.findForUpdate(claimId, access.companyId())
                .orElseThrow(() -> ApiException.notFound("Claim"));
        queries.ensureVisible(access, claim);
        if (claim.getStatus() != ClaimStatus.PENDING_APPROVAL) {
            throw ApiException.conflict("invalid_transition",
                    "Claim " + claim.getReference() + " is " + claim.getStatus() + ", not pending approval");
        }
        if (!ApprovalRules.canDecide(access, claim, queries.priorApproverIds(claim))) {
            throw ApiException.forbidden("You are not an approver for this claim at its current approval level");
        }
        return claim;
    }

    private void saveDecision(CompanyAccess access, ExpenseClaim claim, int level, ApprovalDecision decision,
            String comment) {
        Approval a = new Approval();
        a.setCompanyId(claim.getCompanyId());
        a.setClaimId(claim.getId());
        a.setLevel(level);
        a.setApprover(access.membership());
        a.setDecision(decision);
        a.setComment(comment == null || comment.isBlank() ? null : comment.trim());
        a.setDecidedAt(clock.instant());
        approvals.save(a);
    }
}
