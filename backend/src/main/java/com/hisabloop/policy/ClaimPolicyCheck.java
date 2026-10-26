package com.hisabloop.policy;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "claim_policy_checks")
public class ClaimPolicyCheck {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "company_id", nullable = false, length = 36)
    private String companyId;

    @Column(name = "claim_id", nullable = false, length = 36)
    private String claimId;

    @Enumerated(EnumType.STRING)
    @Column(name = "check_type", nullable = false, length = 30, columnDefinition = "varchar(30)")
    private CheckType checkType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10, columnDefinition = "varchar(10)")
    private CheckResult result;

    @Column(nullable = false)
    private boolean blocking;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(name = "evaluated_at", nullable = false)
    private Instant evaluatedAt;

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }
}
