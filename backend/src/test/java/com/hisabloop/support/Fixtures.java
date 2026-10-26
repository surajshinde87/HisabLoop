package com.hisabloop.support;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.hisabloop.accountant.CaClientRelationship;
import com.hisabloop.claim.ClaimSource;
import com.hisabloop.claim.ClaimStatus;
import com.hisabloop.claim.ExpenseClaim;
import com.hisabloop.company.CompanyAccess;
import com.hisabloop.company.Membership;
import com.hisabloop.company.MembershipStatus;
import com.hisabloop.company.Role;
import com.hisabloop.team.Team;
import com.hisabloop.user.User;

/** Plain-object builders for unit tests (no Spring context, no database). */
public final class Fixtures {

    public static final String COMPANY = "11111111-1111-1111-1111-111111111111";
    public static final String OTHER_COMPANY = "22222222-2222-2222-2222-222222222222";

    private Fixtures() {
    }

    public static User user(String name) {
        User u = new User();
        u.setId(UUID.randomUUID().toString());
        u.setFullName(name);
        u.setEmail(name.toLowerCase().replace(' ', '.') + "@example.test");
        u.setActive(true);
        return u;
    }

    public static Membership member(String name, Role role, Membership manager) {
        return member(COMPANY, name, role, manager);
    }

    public static Membership member(String companyId, String name, Role role, Membership manager) {
        Membership m = new Membership();
        m.setId(UUID.randomUUID().toString());
        m.setUser(user(name));
        m.setCompanyId(companyId);
        m.setRole(role);
        m.setManager(manager);
        m.setStatus(MembershipStatus.ACTIVE);
        Team t = new Team();
        t.setId(UUID.randomUUID().toString());
        t.setName("Sales");
        t.setCompanyId(companyId);
        m.setTeam(t);
        return m;
    }

    public static CompanyAccess access(Membership m) {
        return new CompanyAccess(m.getCompanyId(), m.getUser().getId(), m.getUser().getFullName(), m.getRole(), m,
                null);
    }

    public static CompanyAccess caAccess(String companyId, boolean viewAudit) {
        CaClientRelationship rel = new CaClientRelationship();
        rel.setId(UUID.randomUUID().toString());
        rel.setCompanyId(companyId);
        rel.setCaUserId(UUID.randomUUID().toString());
        rel.setStatus("ACTIVE");
        rel.setCanViewAudit(viewAudit);
        return new CompanyAccess(companyId, rel.getCaUserId(), "CA Partner", Role.CA_PARTNER, null, rel);
    }

    private static int counter = 1000;

    public static ExpenseClaim claim(Membership employee, String amount, ClaimStatus status) {
        ExpenseClaim c = new ExpenseClaim();
        c.setId(UUID.randomUUID().toString());
        c.setCompanyId(employee.getCompanyId());
        c.setClaimNumber(++counter);
        c.setEmployee(employee);
        c.setCategoryCode("TRAVEL");
        c.setVendorName("Uber India");
        c.setReceiptDate(LocalDate.of(2026, 10, 8));
        c.setTotalAmount(new BigDecimal(amount));
        c.setSource(ClaimSource.WEB);
        c.setStatus(status);
        c.setCreatedAt(Instant.parse("2026-10-08T05:00:00Z"));
        return c;
    }
}
