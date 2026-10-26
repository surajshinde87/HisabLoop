package com.hisabloop.company;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import com.hisabloop.common.persistence.BaseEntity;
import com.hisabloop.team.Team;
import com.hisabloop.user.User;

@Getter
@Setter
@Entity
@Table(name = "company_memberships")
public class Membership extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "company_id", nullable = false, length = 36)
    private String companyId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, columnDefinition = "varchar(20)")
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_membership_id")
    private Membership manager;

    @Column(length = 80)
    private String designation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, columnDefinition = "varchar(20)")
    private MembershipStatus status = MembershipStatus.ACTIVE;

    public boolean isActive() {
        return status == MembershipStatus.ACTIVE;
    }
}
