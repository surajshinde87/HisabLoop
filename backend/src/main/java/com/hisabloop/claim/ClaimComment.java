package com.hisabloop.claim;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "claim_comments")
public class ClaimComment {

    public static final String COMMENT = "COMMENT";
    public static final String CLARIFICATION_REQUEST = "CLARIFICATION_REQUEST";
    public static final String CLARIFICATION_RESPONSE = "CLARIFICATION_RESPONSE";

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "company_id", nullable = false, length = 36)
    private String companyId;

    @Column(name = "claim_id", nullable = false, length = 36)
    private String claimId;

    @Column(name = "author_user_id", nullable = false, length = 36)
    private String authorUserId;

    @Column(nullable = false, length = 30)
    private String kind;

    @Column(nullable = false, length = 2000)
    private String body;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
