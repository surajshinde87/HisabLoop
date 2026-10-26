package com.hisabloop.approval;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ApprovalRepository extends JpaRepository<Approval, String> {

    @EntityGraph(attributePaths = {"approver", "approver.user"})
    List<Approval> findByClaimIdOrderByDecidedAtAsc(String claimId);

    /** Pairs of (submittedAt, final approval time) used for the average approval time KPI. */
    @Query("""
            select c.submittedAt, c.approvedAt from ExpenseClaim c
            where c.companyId = :companyId and c.approvedAt is not null and c.submittedAt is not null
              and c.approvedAt >= :from and c.approvedAt < :to
            """)
    List<Object[]> findApprovalDurations(@Param("companyId") String companyId, @Param("from") Instant from,
            @Param("to") Instant to);
}
