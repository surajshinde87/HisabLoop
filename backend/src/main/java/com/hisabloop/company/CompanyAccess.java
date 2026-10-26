package com.hisabloop.company;

import java.util.EnumSet;
import java.util.Set;

import com.hisabloop.accountant.CaClientRelationship;

/**
 * The caller's verified relationship with one company: either an active membership or an active
 * CA client relationship. Built only by {@link CompanyAccessService}; never from client input.
 */
public record CompanyAccess(
        String companyId,
        String userId,
        String userName,
        Role role,
        Membership membership,
        CaClientRelationship caRelationship) {

    public boolean isMember() {
        return membership != null;
    }

    public String membershipId() {
        return membership == null ? null : membership.getId();
    }

    public boolean has(Permission permission) {
        return permissions().contains(permission);
    }

    public Set<Permission> permissions() {
        return switch (role) {
            case ADMIN -> EnumSet.allOf(Permission.class);
            case FINANCE -> EnumSet.of(Permission.VIEW_CLAIMS, Permission.CREATE_CLAIM,
                    Permission.MANAGE_REIMBURSEMENTS, Permission.VIEW_REIMBURSEMENTS, Permission.VIEW_REPORTS,
                    Permission.EXPORT_DATA, Permission.VIEW_POLICIES, Permission.VIEW_TEAM,
                    Permission.VIEW_AUDIT, Permission.REVIEW_ITC);
            case MANAGER -> EnumSet.of(Permission.VIEW_CLAIMS, Permission.CREATE_CLAIM,
                    Permission.APPROVE_CLAIMS, Permission.VIEW_POLICIES, Permission.VIEW_TEAM);
            case EMPLOYEE -> EnumSet.of(Permission.VIEW_CLAIMS, Permission.CREATE_CLAIM,
                    Permission.VIEW_POLICIES);
            case CA_PARTNER -> caPermissions();
        };
    }

    private Set<Permission> caPermissions() {
        EnumSet<Permission> set = EnumSet.noneOf(Permission.class);
        if (caRelationship == null || !caRelationship.isActive()) {
            return set;
        }
        if (caRelationship.isCanViewClaims()) {
            set.add(Permission.VIEW_CLAIMS);
            set.add(Permission.VIEW_REIMBURSEMENTS);
        }
        if (caRelationship.isCanViewReports()) {
            set.add(Permission.VIEW_REPORTS);
        }
        if (caRelationship.isCanExport()) {
            set.add(Permission.EXPORT_DATA);
        }
        if (caRelationship.isCanViewAudit()) {
            set.add(Permission.VIEW_AUDIT);
        }
        if (caRelationship.isCanReviewItc()) {
            set.add(Permission.REVIEW_ITC);
        }
        set.add(Permission.VIEW_POLICIES);
        return set;
    }

    /** Which claims the caller may see. */
    public ClaimScope claimScope() {
        return switch (role) {
            case ADMIN, FINANCE, CA_PARTNER -> ClaimScope.ALL;
            case MANAGER -> ClaimScope.TEAM;
            case EMPLOYEE -> ClaimScope.OWN;
        };
    }

    public enum ClaimScope {
        ALL, TEAM, OWN
    }
}
