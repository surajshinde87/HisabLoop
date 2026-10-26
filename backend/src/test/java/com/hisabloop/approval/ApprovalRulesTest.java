package com.hisabloop.approval;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.hisabloop.claim.ClaimStatus;
import com.hisabloop.claim.ExpenseClaim;
import com.hisabloop.company.Membership;
import com.hisabloop.company.Role;
import com.hisabloop.support.Fixtures;

class ApprovalRulesTest {

    private final Membership sanjay = Fixtures.member("Sanjay", Role.ADMIN, null);
    private final Membership sanjay2 = Fixtures.member("Second Admin", Role.ADMIN, null);
    private final Membership meera = Fixtures.member("Meera", Role.MANAGER, sanjay);
    private final Membership otherManager = Fixtures.member("Other", Role.MANAGER, sanjay);
    private final Membership ravi = Fixtures.member("Ravi", Role.EMPLOYEE, meera);

    @Test
    void reportingManagerCanApproveLevelOne() {
        ExpenseClaim c = Fixtures.claim(ravi, "1240.00", ClaimStatus.PENDING_APPROVAL);
        assertTrue(ApprovalRules.canDecide(Fixtures.access(meera), c, List.of()));
        assertTrue(ApprovalRules.canDecide(Fixtures.access(sanjay), c, List.of()));
    }

    @Test
    void managerOfAnotherTeamCannotApprove() {
        ExpenseClaim c = Fixtures.claim(ravi, "1240.00", ClaimStatus.PENDING_APPROVAL);
        assertFalse(ApprovalRules.canDecide(Fixtures.access(otherManager), c, List.of()));
    }

    @Test
    void nobodyApprovesTheirOwnClaim() {
        ExpenseClaim own = Fixtures.claim(meera, "500.00", ClaimStatus.PENDING_APPROVAL);
        assertFalse(ApprovalRules.canDecide(Fixtures.access(meera), own, List.of()));
        ExpenseClaim adminOwn = Fixtures.claim(sanjay, "500.00", ClaimStatus.PENDING_APPROVAL);
        assertFalse(ApprovalRules.canDecide(Fixtures.access(sanjay), adminOwn, List.of()));
    }

    @Test
    void employeesAndCaPartnersCannotApprove() {
        Membership sneha = Fixtures.member("Sneha", Role.EMPLOYEE, meera);
        ExpenseClaim c = Fixtures.claim(ravi, "100.00", ClaimStatus.PENDING_APPROVAL);
        assertFalse(ApprovalRules.canDecide(Fixtures.access(sneha), c, List.of()));
        assertFalse(ApprovalRules.canDecide(Fixtures.caAccess(Fixtures.COMPANY, true), c, List.of()));
    }

    @Test
    void levelTwoNeedsADifferentAdmin() {
        ExpenseClaim c = Fixtures.claim(ravi, "6500.00", ClaimStatus.PENDING_APPROVAL);
        c.setRequiredApprovalLevels(2);
        c.setApprovalsCompleted(1);
        assertFalse(ApprovalRules.canDecide(Fixtures.access(meera), c, List.of(meera.getId())));
        assertTrue(ApprovalRules.canDecide(Fixtures.access(sanjay), c, List.of(meera.getId())));
        // an admin who already approved level 1 cannot also approve level 2
        assertFalse(ApprovalRules.canDecide(Fixtures.access(sanjay), c, List.of(sanjay.getId())));
        assertTrue(ApprovalRules.canDecide(Fixtures.access(sanjay2), c, List.of(sanjay.getId())));
    }

    @Test
    void onlyPendingClaimsCanBeDecided() {
        ExpenseClaim c = Fixtures.claim(ravi, "100.00", ClaimStatus.APPROVED);
        assertFalse(ApprovalRules.canDecide(Fixtures.access(sanjay), c, List.of()));
    }

    @Test
    void requiredLevelsFollowConfiguredThreshold() {
        BigDecimal threshold = new BigDecimal("5000.00");
        assertEquals(1, ApprovalRules.requiredLevels(new BigDecimal("5000.00"), threshold));
        assertEquals(2, ApprovalRules.requiredLevels(new BigDecimal("5000.01"), threshold));
        assertEquals(2, ApprovalRules.requiredLevels(new BigDecimal("1200.00"), new BigDecimal("1000.00")));
    }
}
