package com.hisabloop.company;

import java.math.BigDecimal;
import java.time.Clock;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hisabloop.accountant.CaClientRelationship;
import com.hisabloop.accountant.CaClientRelationshipRepository;
import com.hisabloop.audit.AuditActor;
import com.hisabloop.audit.AuditService;
import com.hisabloop.auth.AuthDtos;
import com.hisabloop.claim.ClaimService;
import com.hisabloop.claim.GstinValidator;
import com.hisabloop.common.error.ApiException;
import com.hisabloop.config.AppProperties;
import com.hisabloop.policy.PolicyService;
import com.hisabloop.security.CurrentUser;
import com.hisabloop.user.User;
import com.hisabloop.user.UserRepository;

@Service
public class CompanyService {

    private final CompanyRepository companies;
    private final MembershipRepository memberships;
    private final SubscriptionRepository subscriptions;
    private final CaClientRelationshipRepository caRelationships;
    private final CompanyAccessService accessService;
    private final PolicyService policyService;
    private final UserRepository users;
    private final AuditService audit;
    private final AppProperties properties;
    private final Clock clock;

    public CompanyService(CompanyRepository companies, MembershipRepository memberships,
            SubscriptionRepository subscriptions, CaClientRelationshipRepository caRelationships,
            CompanyAccessService accessService, PolicyService policyService, UserRepository users, AuditService audit,
            AppProperties properties, Clock clock) {
        this.companies = companies;
        this.memberships = memberships;
        this.subscriptions = subscriptions;
        this.caRelationships = caRelationships;
        this.accessService = accessService;
        this.policyService = policyService;
        this.users = users;
        this.audit = audit;
        this.properties = properties;
        this.clock = clock;
    }

    /** Creates a company with the given user as its first admin, default policy and planned subscription. */
    @Transactional
    public Company onboard(User owner, CompanyDtos.CreateCompanyRequest req) {
        String gstin = GstinValidator.normalise(req.gstin());
        if (gstin != null && !GstinValidator.isValidFormat(gstin)) {
            throw ApiException.badRequest("invalid_gstin", "Company GSTIN does not match the GSTIN format");
        }
        Company c = new Company();
        c.setName(req.name().trim());
        c.setLegalName(req.legalName());
        c.setGstin(gstin);
        c.setEmail(req.email());
        c.setPhone(req.phone());
        c.setCity(req.city());
        c.setState(req.state());
        c.setPlan(req.plan() == null ? Plan.STARTER : Plan.valueOf(req.plan()));
        c.setStatus("ACTIVE");
        companies.saveAndFlush(c);

        Membership m = new Membership();
        m.setUser(owner);
        m.setCompanyId(c.getId());
        m.setRole(Role.ADMIN);
        m.setDesignation("Owner");
        m.setStatus(MembershipStatus.ACTIVE);
        memberships.save(m);

        Subscription s = new Subscription();
        s.setCompanyId(c.getId());
        s.setPlan(c.getPlan());
        s.setSeats(5);
        s.setPricePerUser(planPrice(c.getPlan()));
        s.setStatus("PLANNED");
        s.setStartedAt(clock.instant());
        subscriptions.save(s);

        policyService.createDefaults(c.getId());
        audit.record(c.getId(), "COMPANY", c.getId(), c.getName(), "COMPANY_CREATED",
                new AuditActor(owner.getId(), owner.getFullName()), null, "ACTIVE", Map.of("plan", c.getPlan().name()));
        return c;
    }

    @Transactional
    public CompanyDtos.CompanyDto create(CompanyDtos.CreateCompanyRequest req) {
        if (!properties.auth().selfRegistrationEnabled()) {
            throw ApiException.forbidden("Company self-service onboarding is disabled. Contact HisabLoop to onboard.");
        }
        User owner = users.findById(CurrentUser.require().userId()).orElseThrow(() -> ApiException.unauthorized("x"));
        Company c = onboard(owner, req);
        return toDto(c);
    }

    @Transactional(readOnly = true)
    public List<AuthDtos.WorkspaceDto> workspaces(String userId) {
        List<AuthDtos.WorkspaceDto> list = new ArrayList<>();
        for (Membership m : memberships.findByUserIdAndStatus(userId, MembershipStatus.ACTIVE)) {
            Company c = companies.findById(m.getCompanyId()).orElse(null);
            if (c == null || !"ACTIVE".equals(c.getStatus())) {
                continue;
            }
            CompanyAccess access = new CompanyAccess(c.getId(), userId, m.getUser().getFullName(), m.getRole(), m, null);
            list.add(new AuthDtos.WorkspaceDto(c.getId(), c.getName(), c.getGstin(), c.getPlan().name(), c.getCity(),
                    c.getState(), m.getRole().name(), m.getId(), "MEMBER", m.getTeam() == null ? null : m.getTeam().getName(),
                    m.getDesignation(), access.permissions().stream().map(Enum::name).sorted().toList()));
        }
        User user = users.findById(userId).orElse(null);
        if (user != null && user.isCaPartner()) {
            for (CaClientRelationship rel : caRelationships.findByCaUserIdOrderByCreatedAt(userId)) {
                if (!rel.isActive()) {
                    continue;
                }
                Company c = companies.findById(rel.getCompanyId()).orElse(null);
                if (c == null || !"ACTIVE".equals(c.getStatus())) {
                    continue;
                }
                CompanyAccess access = new CompanyAccess(c.getId(), userId, user.getFullName(), Role.CA_PARTNER, null,
                        rel);
                list.add(new AuthDtos.WorkspaceDto(c.getId(), c.getName(), c.getGstin(), c.getPlan().name(),
                        c.getCity(), c.getState(), Role.CA_PARTNER.name(), null, "CA_CLIENT", null, null,
                        access.permissions().stream().map(Enum::name).sorted().toList()));
            }
        }
        return list;
    }

    @Transactional(readOnly = true)
    public CompanyDtos.CompanyDto get(String companyId) {
        accessService.require(companyId);
        return toDto(companies.findById(companyId).orElseThrow(() -> ApiException.notFound("Company")));
    }

    @Transactional
    public CompanyDtos.CompanyDto update(String companyId, CompanyDtos.UpdateCompanyRequest req) {
        CompanyAccess access = accessService.require(companyId, Permission.MANAGE_COMPANY);
        Company c = companies.findById(companyId).orElseThrow(() -> ApiException.notFound("Company"));
        Map<String, Object> changes = new LinkedHashMap<>();
        if (req.name() != null && !req.name().isBlank() && !req.name().trim().equals(c.getName())) {
            changes.put("name", req.name().trim());
            c.setName(req.name().trim());
        }
        if (req.legalName() != null) {
            c.setLegalName(req.legalName().isBlank() ? null : req.legalName().trim());
            changes.put("legalName", c.getLegalName());
        }
        if (req.gstin() != null) {
            String g = GstinValidator.normalise(req.gstin());
            if (g != null && !GstinValidator.isValidFormat(g)) {
                throw ApiException.badRequest("invalid_gstin", "Company GSTIN does not match the GSTIN format");
            }
            c.setGstin(g);
            changes.put("gstin", g);
        }
        if (req.email() != null) {
            c.setEmail(req.email().isBlank() ? null : req.email().trim());
            changes.put("email", c.getEmail());
        }
        if (req.phone() != null) {
            c.setPhone(req.phone().isBlank() ? null : req.phone().trim());
            changes.put("phone", c.getPhone());
        }
        if (req.city() != null) {
            c.setCity(req.city().isBlank() ? null : req.city().trim());
            changes.put("city", c.getCity());
        }
        if (req.state() != null) {
            c.setState(req.state().isBlank() ? null : req.state().trim());
            changes.put("state", c.getState());
        }
        if (req.plan() != null && !req.plan().equals(c.getPlan().name())) {
            changes.put("plan", c.getPlan().name() + " -> " + req.plan());
            c.setPlan(Plan.valueOf(req.plan()));
            subscriptions.findFirstByCompanyIdAndStatusOrderByStartedAtDesc(companyId, "PLANNED").ifPresent(s -> {
                s.setPlan(c.getPlan());
                s.setPricePerUser(planPrice(c.getPlan()));
            });
        }
        if (!changes.isEmpty()) {
            audit.record(companyId, "COMPANY", companyId, c.getName(), "COMPANY_UPDATED", ClaimService.actor(access),
                    null, null, changes);
        }
        return toDto(c);
    }

    public List<CompanyDtos.PlanDto> plans() {
        List<CompanyDtos.PlanDto> list = new ArrayList<>();
        for (Plan p : Plan.values()) {
            list.add(new CompanyDtos.PlanDto(p.name(), planPrice(p), "INR"));
        }
        return list;
    }

    private BigDecimal planPrice(Plan plan) {
        BigDecimal price = properties.plans() == null ? null : properties.plans().get(plan.name());
        return price == null ? BigDecimal.ZERO : price;
    }

    private CompanyDtos.CompanyDto toDto(Company c) {
        CompanyDtos.SubscriptionDto sub = subscriptions
                .findFirstByCompanyIdAndStatusOrderByStartedAtDesc(c.getId(), "PLANNED")
                .map(s -> new CompanyDtos.SubscriptionDto(s.getPlan().name(), s.getSeats(), s.getPricePerUser(),
                        s.getStatus(), false))
                .orElse(null);
        return new CompanyDtos.CompanyDto(c.getId(), c.getName(), c.getLegalName(), c.getGstin(), c.getEmail(),
                c.getPhone(), c.getCity(), c.getState(), c.getPlan().name(), c.getStatus(), c.getCreatedAt(),
                memberships.countByCompanyIdAndStatus(c.getId(), MembershipStatus.ACTIVE), sub);
    }
}
