package com.hisabloop.policy;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

/** Starting policy for newly onboarded companies. Every value is editable by company admins. */
public final class PolicyDefaults {

    public static final BigDecimal TWO_LEVEL_APPROVAL_ABOVE = new BigDecimal("5000.00");

    public static final Map<String, BigDecimal> CATEGORY_LIMITS = new LinkedHashMap<>();

    static {
        CATEGORY_LIMITS.put("TRAVEL", new BigDecimal("2000.00"));
        CATEGORY_LIMITS.put("FOOD", new BigDecimal("2500.00"));
        CATEGORY_LIMITS.put("FUEL", new BigDecimal("4000.00"));
        CATEGORY_LIMITS.put("OFFICE", new BigDecimal("5000.00"));
        CATEGORY_LIMITS.put("SOFTWARE", new BigDecimal("10000.00"));
        CATEGORY_LIMITS.put("CLIENT_ENTERTAINMENT", new BigDecimal("6000.00"));
    }

    private PolicyDefaults() {
    }

    public static ExpensePolicy policy(String companyId) {
        ExpensePolicy p = new ExpensePolicy();
        p.setCompanyId(companyId);
        p.setTwoLevelApprovalAbove(TWO_LEVEL_APPROVAL_ABOVE);
        p.setDuplicateDetectionEnabled(true);
        p.setDuplicateWindowDays(90);
        p.setGstinValidationEnabled(true);
        p.setReceiptRequiredAbove(null);
        return p;
    }
}
