package com.hisabloop.team;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, String> {

    List<Team> findByCompanyIdOrderByName(String companyId);

    Optional<Team> findByIdAndCompanyId(String id, String companyId);
}
