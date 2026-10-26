package com.hisabloop.policy;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClaimPolicyCheckRepository extends JpaRepository<ClaimPolicyCheck, String> {

    List<ClaimPolicyCheck> findByClaimIdOrderByCheckType(String claimId);

    List<ClaimPolicyCheck> findByClaimIdIn(Collection<String> claimIds);

    @Modifying(flushAutomatically = true)
    @Query("delete from ClaimPolicyCheck c where c.claimId = :claimId")
    void deleteByClaimId(@Param("claimId") String claimId);
}
