package com.hisabloop.policy;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.hisabloop.claim.ClaimRepository;
import com.hisabloop.claim.ClaimStatus;
import com.hisabloop.claim.DuplicateStatus;
import com.hisabloop.claim.ExpenseClaim;
import com.hisabloop.claim.GstinStatus;
import com.hisabloop.claim.PolicyStatus;
import com.hisabloop.company.Membership;
import com.hisabloop.company.Role;
import com.hisabloop.receipt.Receipt;
import com.hisabloop.receipt.ReceiptRepository;
import com.hisabloop.support.Fixtures;

class PolicyEvaluatorTest {

    private ExpensePolicyRepository policies;
    private PolicyCategoryLimitRepository limits;
    private ClaimPolicyCheckRepository checks;
    private ClaimRepository claims;
    private ReceiptRepository receipts;
    private PolicyEvaluator evaluator;
    private Membership ravi;

    @BeforeEach
    void setUp() {
        policies = mock(ExpensePolicyRepository.class);
        limits = mock(PolicyCategoryLimitRepository.class);
        checks = mock(ClaimPolicyCheckRepository.class);
        claims = mock(ClaimRepository.class);
        receipts = mock(ReceiptRepository.class);
        evaluator = new PolicyEvaluator(policies, limits, checks, claims, receipts,
                Clock.fixed(Instant.parse("2026-10-25T06:00:00Z"), ZoneOffset.UTC));
        when(policies.findByCompanyId(anyString())).thenReturn(Optional.of(PolicyDefaults.policy(Fixtures.COMPANY)));
        when(limits.findByCompanyIdOrderByCategoryCodeAscRoleAsc(anyString())).thenReturn(defaultLimits());
        when(checks.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));
        when(receipts.findByClaimIdOrderByCreatedAtAsc(anyString())).thenReturn(List.of());
        when(claims.findPotentialDuplicates(anyString(), anyString(), anyString(), any(), any(), any()))
                .thenReturn(List.of());
        ravi = Fixtures.member("Ravi", Role.EMPLOYEE, null);
    }

    private static List<PolicyCategoryLimit> defaultLimits() {
        return PolicyDefaults.CATEGORY_LIMITS.entrySet().stream().map(e -> {
            PolicyCategoryLimit l = new PolicyCategoryLimit();
            l.setCategoryCode(e.getKey());
            l.setRole(PolicyCategoryLimit.ALL_ROLES);
            l.setPerClaimLimit(e.getValue());
            return l;
        }).toList();
    }

    @Test
    void missingGstinIsDistinctFromInvalidGstin() {
        ExpensePolicy policy = PolicyDefaults.policy(Fixtures.COMPANY);
        ExpenseClaim c = Fixtures.claim(ravi, "1180.00", ClaimStatus.DRAFT);

        c.setGstAmount(new BigDecimal("180.00"));
        c.setVendorGstin(null);
        assertEquals(CheckResult.WARN, PolicyEvaluator.checkGstin(c, policy).getResult());
        assertEquals(GstinStatus.MISSING, c.getGstinStatus());

        c.setVendorGstin("27ABCDE1234");
        PolicyEvaluator.checkGstin(c, policy);
        assertEquals(GstinStatus.INVALID, c.getGstinStatus());

        c.setVendorGstin("27aabcs1429b1z5");
        ClaimPolicyCheck ok = PolicyEvaluator.checkGstin(c, policy);
        assertEquals(GstinStatus.VALID, c.getGstinStatus());
        assertEquals("27AABCS1429B1Z5", c.getVendorGstin());
        assertTrue(ok.getMessage().contains("format check only"));

        c.setVendorGstin(null);
        c.setGstAmount(BigDecimal.ZERO);
        PolicyEvaluator.checkGstin(c, policy);
        assertEquals(GstinStatus.NOT_APPLICABLE, c.getGstinStatus());
    }

    @Test
    void categoryLimitUsesRoleSpecificOverride() {
        ExpenseClaim c = Fixtures.claim(ravi, "2500.00", ClaimStatus.DRAFT);   // TRAVEL, limit 2000
        ClaimPolicyCheck fail = PolicyEvaluator.checkCategoryLimit(c, defaultLimits());
        assertEquals(CheckResult.FAIL, fail.getResult());
        assertTrue(fail.isBlocking());
        assertTrue(fail.getMessage().contains("by ₹500.00"));

        PolicyCategoryLimit employeeTravel = new PolicyCategoryLimit();
        employeeTravel.setCategoryCode("TRAVEL");
        employeeTravel.setRole("EMPLOYEE");
        employeeTravel.setPerClaimLimit(new BigDecimal("3000.00"));
        List<PolicyCategoryLimit> withOverride = new java.util.ArrayList<>(defaultLimits());
        withOverride.add(employeeTravel);
        assertEquals(CheckResult.PASS, PolicyEvaluator.checkCategoryLimit(c, withOverride).getResult());
    }

    @Test
    void sameVendorAmountAndDateIsFlaggedAsDuplicate() {
        ExpenseClaim earlier = Fixtures.claim(ravi, "1240.00", ClaimStatus.APPROVED);
        earlier.setCreatedAt(Instant.parse("2026-10-08T05:00:00Z"));
        ExpenseClaim c = Fixtures.claim(ravi, "1240.00", ClaimStatus.DRAFT);
        c.setCreatedAt(Instant.parse("2026-10-09T05:00:00Z"));
        when(claims.findPotentialDuplicates(eq(Fixtures.COMPANY), eq(c.getId()), eq("Uber India"), any(), any(), any()))
                .thenReturn(List.of(earlier));

        evaluator.evaluate(c);

        assertEquals(DuplicateStatus.SUSPECTED, c.getDuplicateStatus());
        assertEquals(earlier.getId(), c.getDuplicateOfClaimId());
    }

    @Test
    void matchingVendorAloneIsNotADuplicate() {
        // The repository query requires vendor AND amount AND date, so a same-vendor claim with a
        // different amount is never returned; nothing is flagged.
        ExpenseClaim c = Fixtures.claim(ravi, "999.00", ClaimStatus.DRAFT);
        evaluator.evaluate(c);
        assertEquals(DuplicateStatus.NONE, c.getDuplicateStatus());
        assertNull(c.getDuplicateOfClaimId());
    }

    @Test
    void identicalReceiptChecksumIsFlagged() {
        ExpenseClaim original = Fixtures.claim(ravi, "1850.00", ClaimStatus.APPROVED);
        ExpenseClaim c = Fixtures.claim(ravi, "1850.00", ClaimStatus.DRAFT);
        c.setVendorName("Different spelling");

        Receipt mine = receipt(c.getId(), "abc", "2026-10-09T05:00:00Z");
        Receipt theirs = receipt(original.getId(), "abc", "2026-10-07T05:00:00Z");
        when(receipts.findByClaimIdOrderByCreatedAtAsc(c.getId())).thenReturn(List.of(mine));
        when(receipts.findSameChecksum(eq(Fixtures.COMPANY), eq("abc"), eq(c.getId()), any()))
                .thenReturn(List.of(theirs));
        when(claims.findById(original.getId())).thenReturn(Optional.of(original));

        List<ClaimPolicyCheck> result = evaluator.evaluate(c);

        assertEquals(DuplicateStatus.SUSPECTED, c.getDuplicateStatus());
        assertTrue(result.stream().anyMatch(r -> r.getCheckType() == CheckType.DUPLICATE && r.isBlocking()));
    }

    @Test
    void reviewedNotDuplicateStaysCleared() {
        ExpenseClaim c = Fixtures.claim(ravi, "100.00", ClaimStatus.PENDING_APPROVAL);
        c.setDuplicateStatus(DuplicateStatus.NOT_DUPLICATE);
        List<ClaimPolicyCheck> result = evaluator.evaluate(c);
        assertFalse(result.stream().anyMatch(ClaimPolicyCheck::isBlocking));
        assertEquals(DuplicateStatus.NOT_DUPLICATE, c.getDuplicateStatus());
    }

    @Test
    void policyStatusSummarisesChecks() {
        ExpenseClaim over = Fixtures.claim(ravi, "4500.00", ClaimStatus.DRAFT);
        evaluator.evaluate(over);
        assertEquals(PolicyStatus.VIOLATION, over.getPolicyStatus());

        ExpenseClaim noReceipt = Fixtures.claim(ravi, "180.00", ClaimStatus.DRAFT);
        evaluator.evaluate(noReceipt);
        assertEquals(PolicyStatus.WARNING, noReceipt.getPolicyStatus());   // text claim without receipt
    }

    @Test
    void receiptRequiredAboveThresholdIsBlocking() {
        ExpensePolicy policy = PolicyDefaults.policy(Fixtures.COMPANY);
        policy.setReceiptRequiredAbove(new BigDecimal("500.00"));
        ExpenseClaim c = Fixtures.claim(ravi, "800.00", ClaimStatus.DRAFT);
        ClaimPolicyCheck r = PolicyEvaluator.checkReceipt(c, policy, List.of());
        assertEquals(CheckResult.FAIL, r.getResult());
        assertTrue(r.isBlocking());
    }

    private static Receipt receipt(String claimId, String sha, String created) {
        Receipt r = new Receipt();
        r.setId(java.util.UUID.randomUUID().toString());
        r.setClaimId(claimId);
        r.setCompanyId(Fixtures.COMPANY);
        r.setSha256(sha);
        r.setCreatedAt(Instant.parse(created));
        return r;
    }
}
