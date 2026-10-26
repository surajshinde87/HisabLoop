package com.hisabloop.reimbursement;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** Records a payment that finance made outside HisabLoop (bank transfer etc.). No money moves here. */
@Getter
@Setter
@Entity
@Table(name = "payment_records")
public class PaymentRecord {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "company_id", nullable = false, length = 36)
    private String companyId;

    @Column(name = "batch_id", nullable = false, length = 36)
    private String batchId;

    @Column(nullable = false, length = 20)
    private String method;

    @Column(nullable = false, length = 100)
    private String reference;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(name = "paid_on", nullable = false)
    private LocalDate paidOn;

    @Column(name = "recorded_by_user_id", nullable = false, length = 36)
    private String recordedByUserId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
