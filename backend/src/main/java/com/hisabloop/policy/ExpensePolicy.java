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
@Table(name = "expense_policies")
public class ExpensePolicy extends BaseEntity {

    @Column(name = "company_id", nullable = false, length = 36)
    private String companyId;

    /** Claims with a total strictly above this amount need a second (admin) approval. */
    @Column(name = "two_level_approval_above", nullable = false, precision = 14, scale = 2)
    private BigDecimal twoLevelApprovalAbove;

    @Column(name = "duplicate_detection_enabled", nullable = false)
    private boolean duplicateDetectionEnabled = true;

    @Column(name = "duplicate_window_days", nullable = false)
    private int duplicateWindowDays = 90;

    @Column(name = "gstin_validation_enabled", nullable = false)
    private boolean gstinValidationEnabled = true;

    /** If set, claims above this amount without a receipt fail the RECEIPT check. */
    @Column(name = "receipt_required_above", precision = 14, scale = 2)
    private BigDecimal receiptRequiredAbove;

    @Column(name = "updated_by_user_id", length = 36)
    private String updatedByUserId;
}
