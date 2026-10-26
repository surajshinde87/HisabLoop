package com.hisabloop.policy;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import com.hisabloop.common.persistence.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "policy_category_limits")
public class PolicyCategoryLimit extends BaseEntity {

    public static final String ALL_ROLES = "ALL";

    @Column(name = "company_id", nullable = false, length = 36)
    private String companyId;

    @Column(name = "category_code", nullable = false, length = 40)
    private String categoryCode;

    /** "ALL" or a membership role name (ADMIN, FINANCE, MANAGER, EMPLOYEE). */
    @Column(nullable = false, length = 20)
    private String role = ALL_ROLES;

    @Column(name = "per_claim_limit", nullable = false, precision = 14, scale = 2)
    private BigDecimal perClaimLimit;
}
