package com.hisabloop.audit;

import com.hisabloop.common.util.Hashing;

/**
 * Hash-chain format:
 * sha256(prevHash|eventId|companyId|entityType|entityId|action|actorUserId|occurredAtEpochMillis|previousStatus|newStatus|metadataJson)
 * with null values written as empty strings.
 */
public final class AuditHasher {

    public static final String GENESIS = "0".repeat(64);

    private AuditHasher() {
    }

    public static String hash(AuditEvent e) {
        String canonical = String.join("|",
                e.getPrevHash(),
                e.getEventId(),
                e.getCompanyId(),
                e.getEntityType(),
                e.getEntityId(),
                e.getAction(),
                nz(e.getActorUserId()),
                Long.toString(e.getOccurredAt().toEpochMilli()),
                nz(e.getPreviousStatus()),
                nz(e.getNewStatus()),
                nz(e.getMetadataJson()));
        return Hashing.sha256Hex(canonical);
    }

    private static String nz(String s) {
        return s == null ? "" : s;
    }
}
