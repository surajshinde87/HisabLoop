package com.hisabloop.claim;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClaimRepository extends JpaRepository<ExpenseClaim, String>, JpaSpecificationExecutor<ExpenseClaim> {

    @Override
    @EntityGraph(attributePaths = {"employee", "employee.user", "employee.team"})
    Page<ExpenseClaim> findAll(Specification<ExpenseClaim> spec, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"employee", "employee.user", "employee.team"})
    List<ExpenseClaim> findAll(Specification<ExpenseClaim> spec);

    @EntityGraph(attributePaths = {"employee", "employee.user", "employee.team", "employee.manager"})
    Optional<ExpenseClaim> findByIdAndCompanyId(String id, String companyId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from ExpenseClaim c where c.id = :id and c.companyId = :companyId")
    Optional<ExpenseClaim> findForUpdate(@Param("id") String id, @Param("companyId") String companyId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from ExpenseClaim c where c.companyId = :companyId and c.id in :ids")
    List<ExpenseClaim> findAllForUpdate(@Param("companyId") String companyId, @Param("ids") Collection<String> ids);

    @Query("""
            select c from ExpenseClaim c
            where c.companyId = :companyId and c.id <> :claimId and c.status <> :excluded
              and lower(c.vendorName) = lower(:vendor) and c.totalAmount = :amount and c.receiptDate = :date
            order by c.createdAt asc
            """)
    List<ExpenseClaim> findPotentialDuplicates(@Param("companyId") String companyId, @Param("claimId") String claimId,
            @Param("vendor") String vendor, @Param("amount") BigDecimal amount, @Param("date") LocalDate date,
            @Param("excluded") ClaimStatus excluded);

    @EntityGraph(attributePaths = {"employee", "employee.user", "employee.team", "employee.manager"})
    @Query("select c from ExpenseClaim c where c.companyId = :companyId and c.status = :status order by c.submittedAt asc")
    List<ExpenseClaim> findByCompanyAndStatus(@Param("companyId") String companyId, @Param("status") ClaimStatus status);

    @EntityGraph(attributePaths = {"employee", "employee.user", "employee.team"})
    List<ExpenseClaim> findByBatchIdOrderByClaimNumber(String batchId);

    @EntityGraph(attributePaths = {"employee", "employee.user", "employee.team"})
    List<ExpenseClaim> findTop20ByCompanyIdAndEmployeeIdAndSourceOrderByCreatedAtDesc(String companyId,
            String employeeMembershipId, ClaimSource source);

    long countByCompanyIdAndStatus(String companyId, ClaimStatus status);
}
