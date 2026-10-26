package com.hisabloop.reimbursement;

import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReimbursementBatchRepository extends JpaRepository<ReimbursementBatch, String> {

    List<ReimbursementBatch> findByCompanyIdOrderByBatchNumberDesc(String companyId);

    Optional<ReimbursementBatch> findByIdAndCompanyId(String id, String companyId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from ReimbursementBatch b where b.id = :id and b.companyId = :companyId")
    Optional<ReimbursementBatch> findForUpdate(@Param("id") String id, @Param("companyId") String companyId);

    long countByCompanyIdAndStatus(String companyId, String status);
}
