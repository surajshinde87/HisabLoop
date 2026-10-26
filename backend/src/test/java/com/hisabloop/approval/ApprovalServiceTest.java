package com.hisabloop.approval;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.PlatformTransactionManager;

import com.hisabloop.audit.AuditService;
import com.hisabloop.claim.ClaimCommentRepository;
import com.hisabloop.claim.ClaimDtos;
import com.hisabloop.claim.ClaimQueryService;
import com.hisabloop.claim.ClaimRepository;
import com.hisabloop.claim.ClaimStatus;
import com.hisabloop.claim.ExpenseClaim;
import com.hisabloop.common.error.ApiException;
import com.hisabloop.company.CompanyAccess;
import com.hisabloop.company.CompanyAccessService;
import com.hisabloop.company.Membership;
import com.hisabloop.company.Permission;
import com.hisabloop.company.Role;
import com.hisabloop.integration.ClaimMessenger;
import com.hisabloop.policy.CheckResult;
import com.hisabloop.policy.CheckType;
import com.hisabloop.policy.ClaimPolicyCheck;
import com.hisabloop.policy.ClaimPolicyCheckRepository;
import com.hisabloop.policy.PolicyEvaluator;
import com.hisabloop.receipt.ReceiptRepository;
import com.hisabloop.support.Fixtures;

class ApprovalServiceTest {

    private CompanyAccessService accessService;
    private ClaimRepository claims;
    private ApprovalRepository approvals;
    private PolicyEvaluator evaluator;
    private AuditService audit;
    private ApprovalService service;
    private Membership sanjay;
    private Membership meera;
    private Membership ravi;

    @BeforeEach
    void setUp() {
        accessService = mock(CompanyAccessService.class);
        claims = mock(ClaimRepository.class);
        approvals = mock(ApprovalRepository.class);
        evaluator = mock(PolicyEvaluator.class);
        audit = mock(AuditService.class);
        service = new ApprovalService(accessService, claims, mock(ClaimQueryService.class), approvals,
                mock(ClaimCommentRepository.class), mock(ClaimPolicyCheckRepository.class), evaluator,
                mock(ReceiptRepository.class), audit, mock(ClaimMessenger.class),
                mock(PlatformTransactionManager.class),
                Clock.fixed(Instant.parse("2026-10-25T06:00:00Z"), ZoneOffset.UTC));
        sanjay = Fixtures.member("Sanjay", Role.ADMIN, null);
        meera = Fixtures.member("Meera", Role.MANAGER, sanjay);
        ravi = Fixtures.member("Ravi", Role.EMPLOYEE, meera);
        when(evaluator.evaluate(any())).thenReturn(List.of());
    }

    private void as(Membership m) {
        CompanyAccess a = Fixtures.access(m);
        when(accessService.require(eq(Fixtures.COMPANY), any(Permission.class))).thenReturn(a);
    }

    private ExpenseClaim pending(String amount, int levels) {
        ExpenseClaim c = Fixtures.claim(ravi, amount, ClaimStatus.PENDING_APPROVAL);
        c.setRequiredApprovalLevels(levels);
        when(claims.findForUpdate(c.getId(), Fixtures.COMPANY)).thenReturn(Optional.of(c));
        return c;
    }

    @Test
    void managerApprovalCompletesSingleLevelClaim() {
        as(meera);
        ExpenseClaim c = pending("1240.00", 1);
        service.approve(Fixtures.COMPANY, c.getId(), new ApprovalDtos.ApproveRequest("ok", false));
        assertEquals(ClaimStatus.APPROVED, c.getStatus());
        assertEquals(1, c.getApprovalsCompleted());
        verify(approvals).save(any(Approval.class));
        verify(audit).record(eq(Fixtures.COMPANY), eq("CLAIM"), eq(c.getId()), anyString(), eq("CLAIM_APPROVED"),
                any(), eq("PENDING_APPROVAL"), eq("APPROVED"), anyMap());
    }

    @Test
    void twoLevelClaimStaysPendingAfterFirstApproval() {
        as(meera);
        ExpenseClaim c = pending("6500.00", 2);
        service.approve(Fixtures.COMPANY, c.getId(), null);
        assertEquals(ClaimStatus.PENDING_APPROVAL, c.getStatus());
        assertEquals(1, c.getApprovalsCompleted());

        // the same manager cannot do level 2
        assertThrows(ApiException.class, () -> service.approve(Fixtures.COMPANY, c.getId(), null));

        as(sanjay);
        service.approve(Fixtures.COMPANY, c.getId(), null);
        assertEquals(ClaimStatus.APPROVED, c.getStatus());
    }

    @Test
    void blockingIssuesRequireExplicitAcknowledgement() {
        as(meera);
        ExpenseClaim c = pending("2500.00", 1);
        ClaimPolicyCheck over = new ClaimPolicyCheck();
        over.setCheckType(CheckType.CATEGORY_LIMIT);
        over.setResult(CheckResult.FAIL);
        over.setBlocking(true);
        over.setMessage("Exceeds category limit");
        when(evaluator.evaluate(c)).thenReturn(List.of(over));

        ApiException e = assertThrows(ApiException.class,
                () -> service.approve(Fixtures.COMPANY, c.getId(), new ApprovalDtos.ApproveRequest(null, false)));
        assertEquals("blocking_issues", e.getCode());
        assertEquals(ClaimStatus.PENDING_APPROVAL, c.getStatus());
        verify(approvals, never()).save(any());

        service.approve(Fixtures.COMPANY, c.getId(), new ApprovalDtos.ApproveRequest("Exception approved", true));
        assertEquals(ClaimStatus.APPROVED, c.getStatus());
    }

    @Test
    void unauthorisedManagerCannotApprove() {
        Membership other = Fixtures.member("Other Manager", Role.MANAGER, sanjay);
        as(other);
        ExpenseClaim c = pending("100.00", 1);
        ApiException e = assertThrows(ApiException.class, () -> service.approve(Fixtures.COMPANY, c.getId(), null));
        assertEquals("forbidden", e.getCode());
        assertEquals(ClaimStatus.PENDING_APPROVAL, c.getStatus());
    }

    @Test
    void rejectionRecordsReasonAndIsTerminal() {
        as(meera);
        ExpenseClaim c = pending("100.00", 1);
        service.reject(Fixtures.COMPANY, c.getId(), new ClaimDtos.ReasonRequest("Personal expense"));
        assertEquals(ClaimStatus.REJECTED, c.getStatus());
        assertEquals("Personal expense", c.getRejectionReason());
        ApiException e = assertThrows(ApiException.class, () -> service.approve(Fixtures.COMPANY, c.getId(), null));
        assertEquals("invalid_transition", e.getCode());
    }

    @Test
    void requestChangesReturnsClaimToDraft() {
        as(meera);
        ExpenseClaim c = pending("100.00", 1);
        service.requestChanges(Fixtures.COMPANY, c.getId(), new ClaimDtos.ReasonRequest("Add attendee names"));
        assertEquals(ClaimStatus.DRAFT, c.getStatus());
        assertEquals(true, c.isClarificationRequested());
        verify(audit).record(eq(Fixtures.COMPANY), eq("CLAIM"), eq(c.getId()), anyString(), eq("CHANGES_REQUESTED"),
                any(), eq("PENDING_APPROVAL"), eq("DRAFT"), anyMap());
        verify(audit, never()).record(anyString(), anyString(), anyString(), anyString(), eq("CLAIM_APPROVED"), any(),
                anyString(), anyString(), isNull());
    }
}
