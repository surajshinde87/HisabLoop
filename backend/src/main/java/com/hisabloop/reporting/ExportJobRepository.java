package com.hisabloop.reporting;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ExportJobRepository extends JpaRepository<ExportJob, String> {

    List<ExportJob> findTop20ByCompanyIdOrderByCreatedAtDesc(String companyId);

    Optional<ExportJob> findTopByCompanyIdOrderByCreatedAtDesc(String companyId);
}
