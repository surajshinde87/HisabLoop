package com.hisabloop.team;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import com.hisabloop.common.persistence.BaseEntity;
import com.hisabloop.company.Role;

@Getter
@Setter
@Entity
@Table(name = "invitations")
public class Invitation extends BaseEntity {

    @Column(name = "company_id", nullable = false, length = 36)
    private String companyId;

    @Column(nullable = false, length = 190)
    private String email;

    @Column(name = "full_name", length = 120)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, columnDefinition = "varchar(20)")
    private Role role;

    @Column(name = "team_id", length = 36)
    private String teamId;

    @Column(name = "manager_membership_id", length = 36)
    private String managerMembershipId;

    /** SHA-256 of the emailed token; the token itself is never stored. */
    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "invited_by_user_id", nullable = false, length = 36)
    private String invitedByUserId;

    @Column(name = "accepted_at")
    private Instant acceptedAt;
}
