package com.hisabloop.claim;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ClaimCommentRepository extends JpaRepository<ClaimComment, String> {

    List<ClaimComment> findByClaimIdOrderByCreatedAtAsc(String claimId);
}
