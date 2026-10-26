package com.hisabloop.reimbursement;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReimbursementBatchItemRepository extends JpaRepository<ReimbursementBatchItem, String> {

    List<ReimbursementBatchItem> findByBatchId(String batchId);

    boolean existsByClaimIdIn(Collection<String> claimIds);
}
