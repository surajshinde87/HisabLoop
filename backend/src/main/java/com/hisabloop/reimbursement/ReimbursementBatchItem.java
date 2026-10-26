package com.hisabloop.reimbursement;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "reimbursement_batch_items")
public class ReimbursementBatchItem {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "company_id", nullable = false, length = 36)
    private String companyId;

    @Column(name = "batch_id", nullable = false, length = 36)
    private String batchId;

    @Column(name = "claim_id", nullable = false, length = 36)
    private String claimId;

    @Column(name = "employee_membership_id", nullable = false, length = 36)
    private String employeeMembershipId;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }
}
