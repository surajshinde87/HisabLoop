package com.hisabloop.company;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MembershipRepository extends JpaRepository<Membership, String> {

    @EntityGraph(attributePaths = {"user", "team"})
    Optional<Membership> findByUserIdAndCompanyId(String userId, String companyId);

    @EntityGraph(attributePaths = {"user", "team", "manager", "manager.user"})
    Optional<Membership> findByIdAndCompanyId(String id, String companyId);

    @EntityGraph(attributePaths = {"user", "team"})
    List<Membership> findByUserIdAndStatus(String userId, MembershipStatus status);

    @EntityGraph(attributePaths = {"user", "team", "manager", "manager.user"})
    @Query("select m from Membership m where m.companyId = :companyId order by m.user.fullName")
    List<Membership> findAllForCompany(@Param("companyId") String companyId);

    @Query("select m.id from Membership m where m.manager.id = :managerId and m.companyId = :companyId")
    List<String> findReportIds(@Param("companyId") String companyId, @Param("managerId") String managerId);

    long countByCompanyIdAndStatus(String companyId, MembershipStatus status);

    long countByCompanyIdAndRoleAndStatus(String companyId, Role role, MembershipStatus status);
}
