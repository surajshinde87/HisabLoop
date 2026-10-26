package com.hisabloop.reimbursement;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, String> {

    Optional<PaymentRecord> findByBatchId(String batchId);
}
