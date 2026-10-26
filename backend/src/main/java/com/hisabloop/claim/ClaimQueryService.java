package com.hisabloop.claim;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hisabloop.approval.Approval;
import com.hisabloop.approval.ApprovalDecision;
import com.hisabloop.approval.ApprovalRepository;
import com.hisabloop.approval.ApprovalRules;
import com.hisabloop.audit.AuditEventRepository;
import com.hisabloop.common.error.ApiException;
import com.hisabloop.common.web.PageResponse;
import com.hisabloop.common.web.Pagination;
import com.hisabloop.company.CompanyAccess;
import com.hisabloop.company.CompanyAccessService;
import com.hisabloop.company.Membership;
import com.hisabloop.company.Permission;
import com.hisabloop.company.Role;
import com.hisabloop.policy.ClaimPolicyCheckRepository;
import com.hisabloop.receipt.Receipt;
import com.hisabloop.receipt.ReceiptRepository;
import com.hisabloop.reimbursement.ReimbursementBatchRepository;
import com.hisabloop.user.User;
import com.hisabloop.user.UserRepository;

/** Read side of claims: lists, detail views, visibility rules and available actions. */
@Service
public class ClaimQueryService {

    private static final Map<String, String> SORTS = Map.of(
            "claimNumber", "claimNumber",
            "receiptDate", "receiptDate",
            "totalAmount", "totalAmount",
            "gstAmount", "gstAmount",
            "createdAt", "createdAt",
            "status", "status",
            "vendorName", "vendorName");

    private final CompanyAccessService accessService;
    private final ClaimRepository claims;
    private final ReceiptRepository receipts;
    private final ClaimPolicyCheckRepository checks;
    private final ApprovalRepository approvals;
    private final ClaimCommentRepository comments;
    private final AuditEventRepository auditEvents;
    private final UserRepository users;
    private final ReimbursementBatchRepository batches;

    public ClaimQueryService(CompanyAccessService accessService, ClaimRepository claims, ReceiptRepository receipts,
            ClaimPolicyCheckRepository checks, ApprovalRepository approvals, ClaimCommentRepository comments,
            AuditEventRepository auditEvents, UserRepository users, ReimbursementBatchRepository batches) {
        this.accessService = accessService;
        this.claims = claims;
        this.receipts = receipts;
        this.checks = checks;
        this.approvals = approvals;
        this.comments = comments;
        this.auditEvents = auditEvents;
        this.users = users;
        this.batches = batches;
    }

    @Transactional(readOnly = true)
    public PageResponse<ClaimDtos.ClaimSummary> list(String companyId, ClaimFilter filter, int page, int size,
            String sort) {
        CompanyAccess access = accessService.require(companyId, Permission.VIEW_CLAIMS);
        Pageable pageable = Pagination.of(page, size, sort, SORTS,
                Sort.by(Sort.Direction.DESC, "claimNumber"));
        Page<ExpenseClaim> result = claims.findAll(ClaimSpecifications.build(access, filter), pageable);
        return PageResponse.of(result, ClaimMapper::summary);
    }

    /** KPI cards for the claims page; same scope and filters as the list, ignoring status/flag filters. */
    @Transactional(readOnly = true)
    public ClaimDtos.ClaimListStats stats(String companyId, ClaimFilter filter) {
        CompanyAccess access = accessService.require(companyId, Permission.VIEW_CLAIMS);
        ClaimFilter base = new ClaimFilter(filter.q(), List.of(), filter.categoryCode(),
                filter.employeeMembershipId(), filter.teamId(), filter.from(), filter.to(), false, filter.sources());
        List<ExpenseClaim> all = claims.findAll(ClaimSpecifications.build(access, base));
        return new ClaimDtos.ClaimListStats(
                aggregate(all),
                aggregate(all.stream().filter(c -> c.getStatus() == ClaimStatus.PENDING_APPROVAL).toList()),
                aggregate(all.stream().filter(c -> c.getStatus() == ClaimStatus.APPROVED).toList()),
                aggregate(all.stream().filter(ExpenseClaim::isFlagged)
                        .filter(c -> c.getStatus() != ClaimStatus.REJECTED).toList()));
    }

    private static ClaimDtos.ClaimStats aggregate(Collection<ExpenseClaim> list) {
        BigDecimal sum = list.stream().map(ExpenseClaim::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new ClaimDtos.ClaimStats(list.size(), sum);
    }

    @Transactional(readOnly = true)
    public ClaimDtos.ClaimDetail detail(String companyId, String claimId) {
        CompanyAccess access = accessService.require(companyId, Permission.VIEW_CLAIMS);
        ExpenseClaim claim = claims.findByIdAndCompanyId(claimId, companyId)
                .orElseThrow(() -> ApiException.notFound("Claim"));
        ensureVisible(access, claim);
        return detail(access, claim);
    }

    /** 404 (not 403) for claims outside the caller's scope so ids cannot be probed. */
    public void ensureVisible(CompanyAccess access, ExpenseClaim claim) {
        if (!claim.getCompanyId().equals(access.companyId())) {
            throw ApiException.notFound("Claim");
        }
        boolean visible = switch (access.claimScope()) {
            case ALL -> access.isMember() || claim.getStatus() != ClaimStatus.DRAFT;
            case OWN -> claim.getEmployee().getId().equals(access.membershipId());
            case TEAM -> claim.getEmployee().getId().equals(access.membershipId())
                    || (claim.getEmployee().getManager() != null
                            && claim.getEmployee().getManager().getId().equals(access.membershipId()));
        };
        if (!visible) {
            throw ApiException.notFound("Claim");
        }
    }

    public List<String> priorApproverIds(ExpenseClaim claim) {
        return approvals.findByClaimIdOrderByDecidedAtAsc(claim.getId()).stream()
                .filter(a -> a.getDecision() == ApprovalDecision.APPROVED)
                .filter(a -> claim.getSubmittedAt() == null || !a.getDecidedAt().isBefore(claim.getSubmittedAt()))
                .map(a -> a.getApprover().getId())
                .toList();
    }

    public String expectedApproverName(ExpenseClaim claim) {
        if (claim.getStatus() != ClaimStatus.PENDING_APPROVAL && claim.getStatus() != ClaimStatus.CONFIRMED
                && claim.getStatus() != ClaimStatus.DRAFT) {
            return null;
        }
        if (claim.getApprovalsCompleted() >= 1) {
            return "Company admin";
        }
        Membership manager = claim.getEmployee().getManager();
        if (manager != null && manager.isActive()) {
            return manager.getUser().getFullName();
        }
        return "Company admin";
    }

    public ClaimDtos.ClaimDetail detail(CompanyAccess access, ExpenseClaim c) {
        List<Receipt> claimReceipts = receipts.findByClaimIdOrderByCreatedAtAsc(c.getId());
        List<Approval> claimApprovals = approvals.findByClaimIdOrderByDecidedAtAsc(c.getId());
        List<ClaimComment> claimComments = comments.findByClaimIdOrderByCreatedAtAsc(c.getId());

        Set<String> authorIds = claimComments.stream().map(ClaimComment::getAuthorUserId).collect(Collectors.toSet());
        Map<String, String> names = users.findAllById(authorIds).stream()
                .collect(Collectors.toMap(User::getId, User::getFullName, (a, b) -> a));

        ClaimDtos.Ref duplicateOf = null;
        if (c.getDuplicateOfClaimId() != null) {
            duplicateOf = claims.findById(c.getDuplicateOfClaimId())
                    .map(d -> new ClaimDtos.Ref(d.getId(), d.getReference())).orElse(null);
        }
        ClaimDtos.Ref batch = null;
        if (c.getBatchId() != null) {
            batch = batches.findById(c.getBatchId())
                    .map(b -> new ClaimDtos.Ref(b.getId(), b.getReference())).orElse(null);
        }

        List<ClaimDtos.AuditEntryDto> trail = List.of();
        boolean canSeeAudit = access.isMember() || access.has(Permission.VIEW_AUDIT);
        if (canSeeAudit) {
            trail = auditEvents.findByCompanyIdAndEntityIdOrderBySeqAsc(c.getCompanyId(), c.getId()).stream()
                    .map(e -> new ClaimDtos.AuditEntryDto(e.getEventId(), e.getAction(), e.getActorName(),
                            e.getOccurredAt(), e.getPreviousStatus(), e.getNewStatus(), e.getMetadataJson()))
                    .toList();
        }

        return new ClaimDtos.ClaimDetail(
                c.getId(), c.getReference(), c.getClaimNumber(), ClaimMapper.employee(c.getEmployee()),
                expectedApproverName(c), c.getCategoryCode(), c.getVendorName(), c.getReceiptDate(),
                c.getTotalAmount(), c.getTaxableAmount(), c.getGstAmount(), c.getCgstAmount(), c.getSgstAmount(),
                c.getIgstAmount(), c.getVendorGstin(), c.getGstinStatus(), c.getPaymentMode(), c.getDescription(),
                c.getRawText(), c.getSource(), c.getStatus(), c.isHasReceipt(), c.getRequiredApprovalLevels(),
                c.getApprovalsCompleted(), c.getDuplicateStatus(), duplicateOf, c.getPolicyStatus(),
                c.isClarificationRequested(), c.getItcStatus(), c.getItcNote(), c.getRejectionReason(), batch,
                ClaimMapper.flags(c), c.getCreatedAt(), c.getConfirmedAt(), c.getSubmittedAt(), c.getApprovedAt(),
                c.getRejectedAt(), c.getPaidAt(), c.getVersion(),
                claimReceipts.stream().map(ClaimQueryService::receipt).toList(),
                checks.findByClaimIdOrderByCheckType(c.getId()).stream()
                        .map(k -> new ClaimDtos.PolicyCheckDto(k.getCheckType().name(), k.getResult().name(),
                                k.isBlocking(), k.getMessage()))
                        .toList(),
                claimApprovals.stream()
                        .map(a -> new ClaimDtos.ApprovalDto(a.getId(), a.getLevel(),
                                a.getApprover().getUser().getFullName(), a.getDecision().name(), a.getComment(),
                                a.getDecidedAt()))
                        .toList(),
                claimComments.stream()
                        .map(k -> new ClaimDtos.CommentDto(k.getId(), names.getOrDefault(k.getAuthorUserId(), "User"),
                                k.getAuthorUserId(), k.getKind(), k.getBody(), k.getCreatedAt()))
                        .toList(),
                trail,
                availableActions(access, c, claimApprovals));
    }

    public static ClaimDtos.ReceiptDto receipt(Receipt r) {
        return new ClaimDtos.ReceiptDto(r.getId(), r.getOriginalFilename(), r.getContentType(), r.getSizeBytes(),
                r.getSha256(), r.getProcessingStatus().name(), r.getProvider(), r.getConfidence(), r.getErrorMessage(),
                r.getCreatedAt(), r.getProcessedAt());
    }

    List<String> availableActions(CompanyAccess access, ExpenseClaim c, List<Approval> claimApprovals) {
        List<String> actions = new ArrayList<>();
        boolean owner = access.isMember() && c.getEmployee().getId().equals(access.membershipId());
        boolean adminOrFinance = access.role() == Role.ADMIN || access.role() == Role.FINANCE;
        if (c.getStatus().isEditable() && (owner || adminOrFinance)) {
            actions.add("EDIT");
            actions.add("UPLOAD_RECEIPT");
        }
        if (c.getStatus() == ClaimStatus.DRAFT && (owner || access.role() == Role.ADMIN)) {
            actions.add("CONFIRM");
        }
        if (c.getStatus() == ClaimStatus.CONFIRMED && (owner || access.role() == Role.ADMIN)) {
            actions.add("SUBMIT");
        }
        Set<String> prior = new HashSet<>();
        claimApprovals.stream()
                .filter(a -> a.getDecision() == ApprovalDecision.APPROVED)
                .filter(a -> c.getSubmittedAt() == null || !a.getDecidedAt().isBefore(c.getSubmittedAt()))
                .forEach(a -> prior.add(a.getApprover().getId()));
        boolean decider = ApprovalRules.canDecide(access, c, prior);
        if (decider) {
            actions.add("APPROVE");
            actions.add("REJECT");
            actions.add("REQUEST_CHANGES");
            actions.add("REQUEST_CLARIFICATION");
        }
        if (c.isClarificationRequested() && owner) {
            actions.add("RESPOND_CLARIFICATION");
        }
        actions.add("COMMENT");
        if (c.getDuplicateStatus() == DuplicateStatus.SUSPECTED && (adminOrFinance || decider)) {
            actions.add("RESOLVE_DUPLICATE");
        }
        if (access.has(Permission.REVIEW_ITC) && c.getStatus() != ClaimStatus.DRAFT
                && c.getGstAmount().signum() > 0) {
            actions.add("REVIEW_ITC");
        }
        return actions;
    }

    static <T> Map<String, T> byId(Collection<T> items, Function<T, String> id) {
        return items.stream().collect(Collectors.toMap(id, Function.identity(), (a, b) -> a));
    }
}
