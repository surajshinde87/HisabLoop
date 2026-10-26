package com.hisabloop.claim;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

import org.springframework.data.jpa.domain.Specification;

import com.hisabloop.company.CompanyAccess;
import com.hisabloop.company.Membership;
import com.hisabloop.user.User;

public final class ClaimSpecifications {

    private ClaimSpecifications() {
    }

    /** Company scope + role visibility + filters. Company id always comes from the verified access. */
    public static Specification<ExpenseClaim> build(CompanyAccess access, ClaimFilter f) {
        return (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();
            p.add(cb.equal(root.get("companyId"), access.companyId()));

            Join<ExpenseClaim, Membership> employee = root.join("employee", JoinType.INNER);
            switch (access.claimScope()) {
                case OWN -> p.add(cb.equal(employee.get("id"), access.membershipId()));
                case TEAM -> {
                    Join<Membership, Membership> manager = employee.join("manager", JoinType.LEFT);
                    p.add(cb.or(cb.equal(employee.get("id"), access.membershipId()),
                            cb.equal(manager.get("id"), access.membershipId())));
                }
                case ALL -> {
                    // CA partners never see drafts that the employee has not confirmed yet.
                    if (!access.isMember()) {
                        p.add(cb.notEqual(root.get("status"), ClaimStatus.DRAFT));
                    }
                }
            }

            if (f.statuses() != null && !f.statuses().isEmpty()) {
                p.add(root.get("status").in(f.statuses()));
            }
            if (f.categoryCode() != null && !f.categoryCode().isBlank()) {
                p.add(cb.equal(root.get("categoryCode"), f.categoryCode()));
            }
            if (f.employeeMembershipId() != null && !f.employeeMembershipId().isBlank()) {
                p.add(cb.equal(employee.get("id"), f.employeeMembershipId()));
            }
            if (f.teamId() != null && !f.teamId().isBlank()) {
                p.add(cb.equal(employee.get("team").get("id"), f.teamId()));
            }
            if (f.from() != null) {
                p.add(cb.greaterThanOrEqualTo(root.get("receiptDate"), f.from()));
            }
            if (f.to() != null) {
                p.add(cb.lessThanOrEqualTo(root.get("receiptDate"), f.to()));
            }
            if (f.sources() != null && !f.sources().isEmpty()) {
                p.add(root.get("source").in(f.sources()));
            }
            if (f.flaggedOnly()) {
                p.add(cb.or(
                        root.get("duplicateStatus").in(DuplicateStatus.SUSPECTED, DuplicateStatus.CONFIRMED_DUPLICATE),
                        root.get("gstinStatus").in(GstinStatus.MISSING, GstinStatus.INVALID),
                        cb.equal(root.get("policyStatus"), PolicyStatus.VIOLATION)));
            }
            if (f.q() != null && !f.q().isBlank()) {
                String q = f.q().trim().toLowerCase(Locale.ROOT);
                String like = "%" + q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
                Join<Membership, User> user = employee.join("user", JoinType.INNER);
                List<Predicate> any = new ArrayList<>();
                any.add(cb.like(cb.lower(root.get("vendorName")), like, '\\'));
                any.add(cb.like(cb.lower(user.get("fullName")), like, '\\'));
                any.add(cb.like(cb.lower(root.get("description")), like, '\\'));
                String digits = q.replaceFirst("^#?hl-?", "");
                if (digits.matches("\\d{1,9}")) {
                    any.add(cb.equal(root.get("claimNumber"), Integer.parseInt(digits)));
                }
                p.add(cb.or(any.toArray(Predicate[]::new)));
            }
            return cb.and(p.toArray(Predicate[]::new));
        };
    }
}
