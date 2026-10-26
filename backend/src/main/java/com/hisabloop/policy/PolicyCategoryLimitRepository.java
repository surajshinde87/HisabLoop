package com.hisabloop.policy;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PolicyCategoryLimitRepository extends JpaRepository<PolicyCategoryLimit, String> {

    List<PolicyCategoryLimit> findByCompanyIdOrderByCategoryCodeAscRoleAsc(String companyId);

    @Modifying(flushAutomatically = true, clearAutomatically = false)
    @Query("delete from PolicyCategoryLimit l where l.companyId = :companyId")
    void deleteAllForCompany(@Param("companyId") String companyId);
}
