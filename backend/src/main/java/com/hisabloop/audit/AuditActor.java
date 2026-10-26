package com.hisabloop.audit;

/** Who performed an action. userId is null for system actions. */
public record AuditActor(String userId, String name) {

    public static AuditActor system(String name) {
        return new AuditActor(null, name);
    }
}
