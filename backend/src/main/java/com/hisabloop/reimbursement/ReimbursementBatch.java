package com.hisabloop.reimbursement;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

import com.hisabloop.common.persistence.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "reimbursement_batches")
public class ReimbursementBatch extends BaseEntity {

    public static final String CREATED = "CREATED";
    public static final String PAID = "PAID";

    @Column(name = "company_id", nullable = false, length = 36)
    private String companyId;

    @Column(name = "batch_number", nullable = false)
    private int batchNumber;

    @Column(nullable = false, length = 20)
    private String status = CREATED;

    @Column(name = "total_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "claim_count", nullable = false)
    private int claimCount;

    @Column(length = 500)
    private String notes;

    @Column(name = "created_by_user_id", nullable = false, length = 36)
    private String createdByUserId;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Version
    @Column(nullable = false)
    private int version;

    public String getReference() {
        return "B-" + batchNumber;
    }
}
