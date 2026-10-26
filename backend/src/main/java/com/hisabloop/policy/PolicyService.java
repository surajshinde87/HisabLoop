package com.hisabloop.policy;

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hisabloop.audit.AuditService;
import com.hisabloop.claim.ClaimService;
import com.hisabloop.common.error.ApiException;
import com.hisabloop.company.CompanyAccess;
import com.hisabloop.company.CompanyAccessService;
import com.hisabloop.company.Permission;
import com.hisabloop.user.UserRepository;

@Service
public class PolicyService {

    private final CompanyAccessService accessService;
    private final ExpensePolicyRepository policies;
    private final PolicyCategoryLimitRepository limits;
    private final ExpenseCategoryRepository categories;
    private final UserRepository users;
    private final AuditService audit;

    public PolicyService(CompanyAccessService accessService, ExpensePolicyRepository policies,
            PolicyCategoryLimitRepository limits, ExpenseCategoryRepository categories, UserRepository users,
            AuditService audit) {
        this.accessService = accessService;
        this.policies = policies;
        this.limits = limits;
        this.categories = categories;
        this.users = users;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<PolicyDtos.CategoryDto> categories() {
        return categories.findAllByOrderBySortOrder().stream()
                .map(c -> new PolicyDtos.CategoryDto(c.getCode(), c.getLabel(), c.getIcon())).toList();
    }

    @Transactional(readOnly = true)
    public PolicyDtos.PolicyDto get(String companyId) {
        CompanyAccess access = accessService.require(companyId, Permission.VIEW_POLICIES);
        return toDto(companyId, access);
    }

    @Transactional
    public PolicyDtos.PolicyDto update(String companyId, PolicyDtos.UpdatePolicyRequest req) {
        CompanyAccess access = accessService.require(companyId, Permission.MANAGE_POLICIES);
        Set<String> seen = new HashSet<>();
        for (PolicyDtos.CategoryLimitDto l : req.categoryLimits()) {
            if (!categories.existsById(l.categoryCode())) {
                throw ApiException.badRequest("invalid_category", "Unknown category " + l.categoryCode());
            }
            if (!seen.add(l.categoryCode() + "|" + l.role())) {
                throw ApiException.badRequest("duplicate_limit",
                        "Only one limit per category and role: " + l.categoryCode() + " / " + l.role());
            }
        }

        ExpensePolicy policy = policies.findByCompanyId(companyId).orElseGet(() -> PolicyDefaults.policy(companyId));
        Map<String, Object> before = summary(policy, limits.findByCompanyIdOrderByCategoryCodeAscRoleAsc(companyId));

        policy.setTwoLevelApprovalAbove(req.twoLevelApprovalAbove());
        policy.setDuplicateDetectionEnabled(req.duplicateDetectionEnabled());
        policy.setDuplicateWindowDays(req.duplicateWindowDays());
        policy.setGstinValidationEnabled(req.gstinValidationEnabled());
        policy.setReceiptRequiredAbove(req.receiptRequiredAbove());
        policy.setUpdatedByUserId(access.userId());
        policies.save(policy);

        limits.deleteAllForCompany(companyId);
        List<PolicyCategoryLimit> fresh = req.categoryLimits().stream().map(l -> {
            PolicyCategoryLimit e = new PolicyCategoryLimit();
            e.setCompanyId(companyId);
            e.setCategoryCode(l.categoryCode());
            e.setRole(l.role());
            e.setPerClaimLimit(l.perClaimLimit());
            return e;
        }).toList();
        limits.saveAll(fresh);

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("before", before);
        meta.put("after", summary(policy, fresh));
        audit.record(companyId, "POLICY", policy.getId(), null, "POLICY_UPDATED", ClaimService.actor(access), null,
                null, meta);
        return toDto(companyId, access);
    }

    /** Creates the default policy for a new company. Caller must be in a transaction. */
    @Transactional
    public void createDefaults(String companyId) {
        policies.save(PolicyDefaults.policy(companyId));
        PolicyDefaults.CATEGORY_LIMITS.forEach((code, cap) -> {
            PolicyCategoryLimit l = new PolicyCategoryLimit();
            l.setCompanyId(companyId);
            l.setCategoryCode(code);
            l.setRole(PolicyCategoryLimit.ALL_ROLES);
            l.setPerClaimLimit(cap);
            limits.save(l);
        });
    }

    private PolicyDtos.PolicyDto toDto(String companyId, CompanyAccess access) {
        ExpensePolicy p = policies.findByCompanyId(companyId).orElseGet(() -> PolicyDefaults.policy(companyId));
        List<PolicyDtos.CategoryLimitDto> l = limits.findByCompanyIdOrderByCategoryCodeAscRoleAsc(companyId).stream()
                .map(x -> new PolicyDtos.CategoryLimitDto(x.getCategoryCode(), x.getRole(), x.getPerClaimLimit()))
                .toList();
        String updatedBy = p.getUpdatedByUserId() == null ? null
                : users.findById(p.getUpdatedByUserId()).map(u -> u.getFullName()).orElse(null);
        return new PolicyDtos.PolicyDto(p.getTwoLevelApprovalAbove(), p.isDuplicateDetectionEnabled(),
                p.getDuplicateWindowDays(), p.isGstinValidationEnabled(), p.getReceiptRequiredAbove(), l,
                p.getUpdatedAt(), updatedBy, access.has(Permission.MANAGE_POLICIES));
    }

    private static Map<String, Object> summary(ExpensePolicy p, List<PolicyCategoryLimit> l) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("twoLevelApprovalAbove", p.getTwoLevelApprovalAbove() == null ? null
                : p.getTwoLevelApprovalAbove().toPlainString());
        m.put("duplicateDetectionEnabled", p.isDuplicateDetectionEnabled());
        m.put("duplicateWindowDays", p.getDuplicateWindowDays());
        m.put("gstinValidationEnabled", p.isGstinValidationEnabled());
        m.put("receiptRequiredAbove", p.getReceiptRequiredAbove() == null ? null
                : p.getReceiptRequiredAbove().toPlainString());
        Map<String, String> caps = new LinkedHashMap<>();
        for (PolicyCategoryLimit x : l) {
            caps.put(x.getCategoryCode() + "/" + x.getRole(), x.getPerClaimLimit().toPlainString());
        }
        m.put("categoryLimits", caps);
        return m;
    }
}
