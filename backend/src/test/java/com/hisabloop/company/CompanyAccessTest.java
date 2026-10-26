package com.hisabloop.company;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import com.hisabloop.support.Fixtures;

class CompanyAccessTest {

    @Test
    void adminHasEveryPermission() {
        CompanyAccess a = Fixtures.access(Fixtures.member("Sanjay", Role.ADMIN, null));
        for (Permission p : Permission.values()) {
            assertTrue(a.has(p), p.name());
        }
        assertEquals(CompanyAccess.ClaimScope.ALL, a.claimScope());
    }

    @Test
    void employeeSeesOnlyOwnClaimsAndCannotManage() {
        CompanyAccess a = Fixtures.access(Fixtures.member("Ravi", Role.EMPLOYEE, null));
        assertEquals(CompanyAccess.ClaimScope.OWN, a.claimScope());
        assertTrue(a.has(Permission.CREATE_CLAIM));
        assertFalse(a.has(Permission.APPROVE_CLAIMS));
        assertFalse(a.has(Permission.MANAGE_REIMBURSEMENTS));
        assertFalse(a.has(Permission.VIEW_AUDIT));
        assertFalse(a.has(Permission.MANAGE_POLICIES));
    }

    @Test
    void managerSeesTeamAndApproves() {
        CompanyAccess a = Fixtures.access(Fixtures.member("Meera", Role.MANAGER, null));
        assertEquals(CompanyAccess.ClaimScope.TEAM, a.claimScope());
        assertTrue(a.has(Permission.APPROVE_CLAIMS));
        assertFalse(a.has(Permission.MANAGE_TEAM));
    }

    @Test
    void financeManagesPayoutsButNotPolicies() {
        CompanyAccess a = Fixtures.access(Fixtures.member("Anita", Role.FINANCE, null));
        assertTrue(a.has(Permission.MANAGE_REIMBURSEMENTS));
        assertTrue(a.has(Permission.EXPORT_DATA));
        assertFalse(a.has(Permission.MANAGE_POLICIES));
        assertFalse(a.has(Permission.APPROVE_CLAIMS));
    }

    @Test
    void caPermissionsFollowTheRelationshipFlags() {
        CompanyAccess withAudit = Fixtures.caAccess(Fixtures.COMPANY, true);
        CompanyAccess withoutAudit = Fixtures.caAccess(Fixtures.COMPANY, false);
        assertTrue(withAudit.has(Permission.VIEW_AUDIT));
        assertFalse(withoutAudit.has(Permission.VIEW_AUDIT));
        assertTrue(withoutAudit.has(Permission.VIEW_REPORTS));
        assertTrue(withoutAudit.has(Permission.REVIEW_ITC));
        assertFalse(withoutAudit.has(Permission.CREATE_CLAIM));
        assertFalse(withoutAudit.has(Permission.MANAGE_REIMBURSEMENTS));
        assertFalse(withoutAudit.isMember());
    }

    @Test
    void revokedCaRelationshipGrantsNothing() {
        CompanyAccess a = Fixtures.caAccess(Fixtures.COMPANY, true);
        a.caRelationship().setStatus("REVOKED");
        assertTrue(a.permissions().isEmpty());
    }
}
