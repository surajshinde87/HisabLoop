package com.hisabloop.audit;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import org.hibernate.annotations.Immutable;

/** Append-only audit record. Hibernate never issues UPDATEs for it and the DB rejects them. */
@Getter
@Setter
@Entity
@Immutable
@Table(name = "audit_events")
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long seq;

    @Column(name = "id", nullable = false, length = 36, updatable = false)
    private String eventId;

    @Column(name = "company_id", nullable = false, length = 36)
    private String companyId;

    @Column(name = "entity_type", nullable = false, length = 40)
    private String entityType;

    @Column(name = "entity_id", nullable = false, length = 36)
    private String entityId;

    @Column(name = "entity_ref", length = 40)
    private String entityRef;

    @Column(nullable = false, length = 60)
    private String action;

    @Column(name = "actor_user_id", length = 36)
    private String actorUserId;

    @Column(name = "actor_name", nullable = false, length = 120)
    private String actorName;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(name = "previous_status", length = 30)
    private String previousStatus;

    @Column(name = "new_status", length = 30)
    private String newStatus;

    @Column(name = "metadata_json", columnDefinition = "TEXT")
    private String metadataJson;

    @Column(name = "prev_hash", nullable = false, length = 64)
    private String prevHash;

    @Column(nullable = false, length = 64)
    private String hash;
}
