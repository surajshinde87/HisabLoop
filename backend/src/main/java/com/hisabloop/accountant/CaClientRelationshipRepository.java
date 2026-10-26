package com.hisabloop.accountant;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CaClientRelationshipRepository extends JpaRepository<CaClientRelationship, String> {

    Optional<CaClientRelationship> findByCaUserIdAndCompanyId(String caUserId, String companyId);

    List<CaClientRelationship> findByCaUserIdOrderByCreatedAt(String caUserId);

    List<CaClientRelationship> findByCompanyIdAndStatus(String companyId, String status);
}
