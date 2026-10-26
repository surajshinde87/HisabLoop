package com.hisabloop.receipt;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReceiptRepository extends JpaRepository<Receipt, String> {

    List<Receipt> findByClaimIdOrderByCreatedAtAsc(String claimId);

    Optional<Receipt> findByIdAndCompanyId(String id, String companyId);

    @Query("""
            select r from Receipt r
            where r.companyId = :companyId and r.sha256 = :sha and r.claimId <> :claimId and r.createdAt >= :since
            order by r.createdAt asc
            """)
    List<Receipt> findSameChecksum(@Param("companyId") String companyId, @Param("sha") String sha,
            @Param("claimId") String claimId, @Param("since") Instant since);
}
