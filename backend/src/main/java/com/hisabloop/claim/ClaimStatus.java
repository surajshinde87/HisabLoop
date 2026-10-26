package com.hisabloop.claim;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Claim lifecycle. Normal flow: DRAFT → CONFIRMED → PENDING_APPROVAL → APPROVED → IN_BATCH → PAID.
 * Side paths: CONFIRMED → DRAFT (employee edits), PENDING_APPROVAL → REJECTED,
 * PENDING_APPROVAL → DRAFT (approver requested changes). REJECTED and PAID are terminal.
 */
public enum ClaimStatus {
    DRAFT,
    CONFIRMED,
    PENDING_APPROVAL,
    APPROVED,
    REJECTED,
    IN_BATCH,
    PAID;

    private static final Map<ClaimStatus, Set<ClaimStatus>> ALLOWED = new EnumMap<>(ClaimStatus.class);

    static {
        ALLOWED.put(DRAFT, EnumSet.of(CONFIRMED));
        ALLOWED.put(CONFIRMED, EnumSet.of(PENDING_APPROVAL, DRAFT));
        ALLOWED.put(PENDING_APPROVAL, EnumSet.of(APPROVED, REJECTED, DRAFT));
        ALLOWED.put(APPROVED, EnumSet.of(IN_BATCH));
        ALLOWED.put(IN_BATCH, EnumSet.of(PAID));
        ALLOWED.put(REJECTED, EnumSet.noneOf(ClaimStatus.class));
        ALLOWED.put(PAID, EnumSet.noneOf(ClaimStatus.class));
    }

    public boolean canTransitionTo(ClaimStatus target) {
        return ALLOWED.get(this).contains(target);
    }

    public Set<ClaimStatus> allowedTargets() {
        return EnumSet.copyOf(ALLOWED.get(this).isEmpty() ? EnumSet.noneOf(ClaimStatus.class) : ALLOWED.get(this));
    }

    public boolean isEditable() {
        return this == DRAFT || this == CONFIRMED;
    }
}
