package com.hisabloop.accountant;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import com.hisabloop.common.persistence.BaseEntity;

/** Explicit, revocable grant for a CA partner to access one client company. */
@Getter
@Setter
@Entity
@Table(name = "ca_client_relationships")
public class CaClientRelationship extends BaseEntity {

    @Column(name = "ca_user_id", nullable = false, length = 36)
    private String caUserId;

    @Column(name = "company_id", nullable = false, length = 36)
    private String companyId;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "can_view_claims", nullable = false)
    private boolean canViewClaims = true;

    @Column(name = "can_view_reports", nullable = false)
    private boolean canViewReports = true;

    @Column(name = "can_export", nullable = false)
    private boolean canExport = true;

    @Column(name = "can_view_audit", nullable = false)
    private boolean canViewAudit;

    @Column(name = "can_review_itc", nullable = false)
    private boolean canReviewItc = true;

    @Column(name = "last_export_at")
    private Instant lastExportAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    public boolean isActive() {
        return "ACTIVE".equals(status);
    }
}
