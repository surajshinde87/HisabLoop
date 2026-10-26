package com.hisabloop.approval;

import java.util.Collection;

import com.hisabloop.claim.ClaimStatus;
import com.hisabloop.claim.ExpenseClaim;
import com.hisabloop.company.CompanyAccess;
import com.hisabloop.company.Membership;
import com.hisabloop.company.Permission;
import com.hisabloop.company.Role;

/**
 * Who may decide on a pending claim.
 * <ul>
 * <li>Nobody approves their own claim.</li>
 * <li>Level 1: the claimant's reporting manager, or a company admin.</li>
 * <li>Level 2 (claims above the policy threshold): a company admin who did not approve level 1.</li>
 * </ul>
 */
public final class ApprovalRules {

    private ApprovalRules() {
    }

    public static boolean canDecide(CompanyAccess access, ExpenseClaim claim, Collection<String> priorApproverIds) {
        if (claim.getStatus() != ClaimStatus.PENDING_APPROVAL) {
            return false;
        }
        if (!access.isMember() || !access.has(Permission.APPROVE_CLAIMS)) {
            return false;
        }
        Membership employee = claim.getEmployee();
        if (employee.getId().equals(access.membershipId())) {
            return false;
        }
        int level = claim.getApprovalsCompleted() + 1;
        if (level == 1) {
            if (access.role() == Role.ADMIN) {
                return true;
            }
            Membership manager = employee.getManager();
            return access.role() == Role.MANAGER && manager != null && manager.getId().equals(access.membershipId());
        }
        return access.role() == Role.ADMIN && !priorApproverIds.contains(access.membershipId());
    }

    public static int requiredLevels(java.math.BigDecimal total, java.math.BigDecimal twoLevelAbove) {
        return total != null && twoLevelAbove != null && total.compareTo(twoLevelAbove) > 0 ? 2 : 1;
    }
}
