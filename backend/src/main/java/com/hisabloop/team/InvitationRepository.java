package com.hisabloop.team;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InvitationRepository extends JpaRepository<Invitation, String> {

    Optional<Invitation> findByTokenHash(String tokenHash);

    List<Invitation> findByCompanyIdAndStatusOrderByCreatedAtDesc(String companyId, String status);

    boolean existsByCompanyIdAndEmailIgnoreCaseAndStatus(String companyId, String email, String status);
}
