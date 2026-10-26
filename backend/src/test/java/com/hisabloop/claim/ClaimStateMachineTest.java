package com.hisabloop.claim;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import com.hisabloop.common.error.ApiException;
import com.hisabloop.company.Role;
import com.hisabloop.support.Fixtures;

class ClaimStateMachineTest {

    @Test
    void normalFlowIsAllowed() {
        ExpenseClaim c = Fixtures.claim(Fixtures.member("Ravi", Role.EMPLOYEE, null), "100.00", ClaimStatus.DRAFT);
        c.transitionTo(ClaimStatus.CONFIRMED);
        c.transitionTo(ClaimStatus.PENDING_APPROVAL);
        c.transitionTo(ClaimStatus.APPROVED);
        c.transitionTo(ClaimStatus.IN_BATCH);
        assertEquals(ClaimStatus.IN_BATCH, c.transitionTo(ClaimStatus.PAID));
        assertEquals(ClaimStatus.PAID, c.getStatus());
    }

    @Test
    void draftCannotBePaid() {
        ExpenseClaim c = Fixtures.claim(Fixtures.member("Ravi", Role.EMPLOYEE, null), "100.00", ClaimStatus.DRAFT);
        ApiException e = assertThrows(ApiException.class, () -> c.transitionTo(ClaimStatus.PAID));
        assertEquals("invalid_transition", e.getCode());
        assertEquals(ClaimStatus.DRAFT, c.getStatus());
    }

    @Test
    void rejectedClaimCannotEnterBatch() {
        assertFalse(ClaimStatus.REJECTED.canTransitionTo(ClaimStatus.IN_BATCH));
        assertTrue(ClaimStatus.REJECTED.allowedTargets().isEmpty());
    }

    @Test
    void paidClaimCannotBePaidTwice() {
        ExpenseClaim c = Fixtures.claim(Fixtures.member("Ravi", Role.EMPLOYEE, null), "100.00", ClaimStatus.PAID);
        assertThrows(ApiException.class, () -> c.transitionTo(ClaimStatus.PAID));
    }

    @Test
    void batchedClaimCannotBeBatchedAgain() {
        assertFalse(ClaimStatus.IN_BATCH.canTransitionTo(ClaimStatus.IN_BATCH));
    }

    @Test
    void pendingCanBeRejectedOrSentBackForChanges() {
        assertTrue(ClaimStatus.PENDING_APPROVAL.canTransitionTo(ClaimStatus.REJECTED));
        assertTrue(ClaimStatus.PENDING_APPROVAL.canTransitionTo(ClaimStatus.DRAFT));
        assertFalse(ClaimStatus.CONFIRMED.canTransitionTo(ClaimStatus.APPROVED));
    }

    @Test
    void onlyDraftAndConfirmedAreEditable() {
        for (ClaimStatus s : ClaimStatus.values()) {
            assertEquals(s == ClaimStatus.DRAFT || s == ClaimStatus.CONFIRMED, s.isEditable(), s.name());
        }
    }
}
