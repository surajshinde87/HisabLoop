package com.hisabloop.claim;

public enum GstinStatus {
    /** Matches the GSTIN format. Does not prove the GSTIN is registered, active or the vendor's. */
    VALID,
    /** GST was charged but no supplier GSTIN was captured. */
    MISSING,
    /** A GSTIN was captured but does not match the format. */
    INVALID,
    /** No GST on the claim, so no GSTIN is expected. */
    NOT_APPLICABLE,
    /** Company policy has GSTIN validation switched off. */
    NOT_CHECKED
}
