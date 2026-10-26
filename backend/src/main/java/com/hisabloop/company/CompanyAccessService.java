package com.hisabloop.company;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hisabloop.accountant.CaClientRelationship;
import com.hisabloop.accountant.CaClientRelationshipRepository;
import com.hisabloop.common.error.ApiException;
import com.hisabloop.security.CurrentUser;
import com.hisabloop.user.User;
import com.hisabloop.user.UserRepository;

/**
 * Single place where a company id coming from a URL is turned into a verified access context.
 * Unknown and unauthorised companies both produce 404 so ids cannot be probed.
 */
@Service
public class CompanyAccessService {

    private final MembershipRepository memberships;
    private final CaClientRelationshipRepository caRelationships;
    private final CompanyRepository companies;
    private final UserRepository users;

    public CompanyAccessService(MembershipRepository memberships, CaClientRelationshipRepository caRelationships,
            CompanyRepository companies, UserRepository users) {
        this.memberships = memberships;
        this.caRelationships = caRelationships;
        this.companies = companies;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public CompanyAccess require(String companyId) {
        return resolve(CurrentUser.require().userId(), companyId)
                .orElseThrow(() -> ApiException.notFound("Company"));
    }

    @Transactional(readOnly = true)
    public CompanyAccess require(String companyId, Permission permission) {
        CompanyAccess access = require(companyId);
        if (!access.has(permission)) {
            throw ApiException.forbidden("You do not have permission to perform this action");
        }
        return access;
    }

    @Transactional(readOnly = true)
    public Optional<CompanyAccess> resolve(String userId, String companyId) {
        if (companyId == null || companyId.length() != 36) {
            return Optional.empty();
        }
        Company company = companies.findById(companyId).orElse(null);
        if (company == null || !"ACTIVE".equals(company.getStatus())) {
            return Optional.empty();
        }
        User user = users.findById(userId).filter(User::isActive).orElse(null);
        if (user == null) {
            return Optional.empty();
        }
        Optional<Membership> membership = memberships.findByUserIdAndCompanyId(userId, companyId)
                .filter(Membership::isActive);
        if (membership.isPresent()) {
            Membership m = membership.get();
            return Optional.of(new CompanyAccess(companyId, userId, user.getFullName(), m.getRole(), m, null));
        }
        if (user.isCaPartner()) {
            Optional<CaClientRelationship> rel = caRelationships.findByCaUserIdAndCompanyId(userId, companyId)
                    .filter(CaClientRelationship::isActive);
            if (rel.isPresent()) {
                return Optional.of(new CompanyAccess(companyId, userId, user.getFullName(), Role.CA_PARTNER,
                        null, rel.get()));
            }
        }
        return Optional.empty();
    }
}
