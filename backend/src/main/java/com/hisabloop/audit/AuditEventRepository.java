package com.hisabloop.audit;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AuditEventRepository extends JpaRepository<AuditEvent, Long>, JpaSpecificationExecutor<AuditEvent> {

    Optional<AuditEvent> findTopByCompanyIdOrderBySeqDesc(String companyId);

    List<AuditEvent> findByCompanyIdAndEntityIdOrderBySeqAsc(String companyId, String entityId);

    List<AuditEvent> findByCompanyIdOrderBySeqAsc(String companyId);
}
