package com.hisabloop.reporting;

import java.util.EnumSet;
import java.util.Set;

import com.hisabloop.claim.ClaimStatus;

/** Shared definitions so the dashboard, reports and exports always agree. */
public final class Spend {

    /** "Spend" = claims submitted for approval and not rejected. */
    public static final Set<ClaimStatus> SPEND_STATUSES =
            EnumSet.of(ClaimStatus.PENDING_APPROVAL, ClaimStatus.APPROVED, ClaimStatus.IN_BATCH, ClaimStatus.PAID);

    /** GST reporting uses approved claims only (what will be booked). */
    public static final Set<ClaimStatus> GST_STATUSES =
            EnumSet.of(ClaimStatus.APPROVED, ClaimStatus.IN_BATCH, ClaimStatus.PAID);

    public static final String SPEND_BASIS = "Submitted claims (pending approval, approved, in batch, paid); rejected and draft claims excluded";
    public static final String GST_BASIS = "Approved claims (approved, in batch, paid)";

    private Spend() {
    }
}
