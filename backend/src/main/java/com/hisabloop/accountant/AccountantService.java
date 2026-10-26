package com.hisabloop.accountant;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hisabloop.audit.AuditService;
import com.hisabloop.claim.ClaimFilter;
import com.hisabloop.claim.ClaimRepository;
import com.hisabloop.claim.ClaimService;
import com.hisabloop.claim.ClaimSpecifications;
import com.hisabloop.claim.ClaimStatus;
import com.hisabloop.claim.ExpenseClaim;
import com.hisabloop.claim.ItcStatus;
import com.hisabloop.common.error.ApiException;
import com.hisabloop.company.Company;
import com.hisabloop.company.CompanyAccess;
import com.hisabloop.company.CompanyAccessService;
import com.hisabloop.company.CompanyRepository;
import com.hisabloop.company.Permission;
import com.hisabloop.company.Role;
import com.hisabloop.reporting.ExportService;
import com.hisabloop.reporting.ReportDtos;
import com.hisabloop.reporting.ReportService;
import com.hisabloop.reporting.Spend;
import com.hisabloop.security.CurrentUser;
import com.hisabloop.user.User;
import com.hisabloop.user.UserRepository;

@Service
public class AccountantService {

    private final CaClientRelationshipRepository relationships;
    private final CompanyRepository companies;
    private final CompanyAccessService accessService;
    private final ClaimRepository claims;
    private final ReportService reports;
    private final ExportService exports;
    private final UserRepository users;
    private final AuditService audit;
    private final Clock clock;

    public AccountantService(CaClientRelationshipRepository relationships, CompanyRepository companies,
            CompanyAccessService accessService, ClaimRepository claims, ReportService reports, ExportService exports,
            UserRepository users, AuditService audit, Clock clock) {
        this.relationships = relationships;
        this.companies = companies;
        this.accessService = accessService;
        this.claims = claims;
        this.reports = reports;
        this.exports = exports;
        this.users = users;
        this.audit = audit;
        this.clock = clock;
    }

    /** Client companies of the signed-in CA partner (explicit relationships only). */
    @Transactional(readOnly = true)
    public List<AccountantDtos.ClientDto> clients() {
        String userId = CurrentUser.require().userId();
        User user = users.findById(userId).orElseThrow(() -> ApiException.unauthorized("Authentication required"));
        if (!user.isCaPartner()) {
            throw ApiException.forbidden("The accountant portal is only available to CA partner accounts");
        }
        List<AccountantDtos.ClientDto> list = new ArrayList<>();
        for (CaClientRelationship rel : relationships.findByCaUserIdOrderByCreatedAt(userId)) {
            Company c = companies.findById(rel.getCompanyId()).orElse(null);
            if (c == null) {
                continue;
            }
            if (!rel.isActive()) {
                list.add(new AccountantDtos.ClientDto(c.getId(), c.getName(), c.getGstin(), c.getCity(), c.getState(),
                        0, 0, null, rel.getLastExportAt(), "REVOKED", List.of()));
                continue;
            }
            CompanyAccess access = accessService.resolve(userId, c.getId()).orElse(null);
            if (access == null) {
                continue;
            }
            list.add(client(c, rel, access));
        }
        return list;
    }

    @Transactional(readOnly = true)
    public AccountantDtos.ClientSummary summary(String companyId) {
        CompanyAccess access = accessService.require(companyId);
        if (access.role() != Role.CA_PARTNER) {
            throw ApiException.notFound("Client");
        }
        Company c = companies.findById(companyId).orElseThrow(() -> ApiException.notFound("Client"));
        AccountantDtos.ClientDto client = client(c, access.caRelationship(), access);
        Map<String, Long> byStatus = new LinkedHashMap<>();
        if (access.has(Permission.VIEW_CLAIMS)) {
            List<ExpenseClaim> visible = claims.findAll(ClaimSpecifications.build(access,
                    new ClaimFilter(null, List.of(), null, null, null, null, null, false, null)));
            for (ClaimStatus s : ClaimStatus.values()) {
                if (s == ClaimStatus.DRAFT) {
                    continue;
                }
                byStatus.put(s.name(), visible.stream().filter(x -> x.getStatus() == s).count());
            }
        }
        List<ReportDtos.GstMonth> months = List.of();
        BigDecimal gstTotal = BigDecimal.ZERO;
        BigDecimal eligible = BigDecimal.ZERO;
        if (access.has(Permission.VIEW_REPORTS)) {
            ReportDtos.GstReport gst = reports.gst(companyId, quarterStart(), null);
            months = gst.months();
            gstTotal = gst.totalGst();
            eligible = gst.itcMarkedEligible();
        }
        List<ReportDtos.ExportJobDto> recent = access.has(Permission.VIEW_REPORTS)
                ? exports.history(companyId).stream().limit(5).toList() : List.of();
        return new AccountantDtos.ClientSummary(client, byStatus, months, gstTotal, eligible, recent);
    }

    // ---------------------------------------------------------------- admin side

    @Transactional(readOnly = true)
    public List<AccountantDtos.CaPartnerDto> partners(String companyId) {
        accessService.require(companyId, Permission.MANAGE_COMPANY);
        return relationships.findByCompanyIdAndStatus(companyId, "ACTIVE").stream().map(this::partnerDto).toList();
    }

    @Transactional
    public AccountantDtos.CaPartnerDto grant(String companyId, AccountantDtos.GrantRequest req) {
        CompanyAccess access = accessService.require(companyId, Permission.MANAGE_COMPANY);
        User ca = users.findByEmailIgnoreCase(req.email().trim())
                .filter(User::isCaPartner)
                .orElseThrow(() -> ApiException.notFound("CA partner account with this email"));
        CaClientRelationship rel = relationships.findByCaUserIdAndCompanyId(ca.getId(), companyId)
                .orElseGet(CaClientRelationship::new);
        rel.setCaUserId(ca.getId());
        rel.setCompanyId(companyId);
        rel.setStatus("ACTIVE");
        rel.setRevokedAt(null);
        rel.setCanViewClaims(true);
        rel.setCanViewReports(true);
        rel.setCanExport(req.canExport() == null || req.canExport());
        rel.setCanViewAudit(Boolean.TRUE.equals(req.canViewAudit()));
        rel.setCanReviewItc(req.canReviewItc() == null || req.canReviewItc());
        relationships.save(rel);
        audit.record(companyId, "CA_RELATIONSHIP", rel.getId(), ca.getFullName(), "CA_ACCESS_GRANTED",
                ClaimService.actor(access), null, "ACTIVE",
                Map.of("caEmail", ca.getEmail(), "canViewAudit", rel.isCanViewAudit(), "canExport", rel.isCanExport()));
        return partnerDto(rel);
    }

    @Transactional
    public void revoke(String companyId, String relationshipId) {
        CompanyAccess access = accessService.require(companyId, Permission.MANAGE_COMPANY);
        CaClientRelationship rel = relationships.findById(relationshipId)
                .filter(r -> r.getCompanyId().equals(companyId))
                .orElseThrow(() -> ApiException.notFound("CA relationship"));
        if (!rel.isActive()) {
            return;
        }
        rel.setStatus("REVOKED");
        rel.setRevokedAt(clock.instant());
        audit.record(companyId, "CA_RELATIONSHIP", rel.getId(), null, "CA_ACCESS_REVOKED", ClaimService.actor(access),
                "ACTIVE", "REVOKED", null);
    }

    private AccountantDtos.CaPartnerDto partnerDto(CaClientRelationship r) {
        User u = users.findById(r.getCaUserId()).orElse(null);
        return new AccountantDtos.CaPartnerDto(r.getId(), r.getCaUserId(), u == null ? null : u.getFullName(),
                u == null ? null : u.getEmail(), u == null ? null : u.getFirmName(), r.getStatus(), r.isCanViewClaims(),
                r.isCanViewReports(), r.isCanExport(), r.isCanViewAudit(), r.isCanReviewItc(), r.getLastExportAt(),
                r.getCreatedAt());
    }

    private AccountantDtos.ClientDto client(Company c, CaClientRelationship rel, CompanyAccess access) {
        long pending = 0;
        long awaitingItc = 0;
        BigDecimal completeness = null;
        if (access.has(Permission.VIEW_CLAIMS)) {
            List<ExpenseClaim> visible = claims.findAll(ClaimSpecifications.build(access,
                    new ClaimFilter(null, List.of(), null, null, null, null, null, false, null)));
            pending = visible.stream().filter(x -> x.getStatus() == ClaimStatus.PENDING_APPROVAL).count();
            awaitingItc = visible.stream()
                    .filter(x -> Spend.GST_STATUSES.contains(x.getStatus()) && x.getGstAmount().signum() > 0
                            && x.getItcStatus() == ItcStatus.UNREVIEWED)
                    .count();
        }
        if (access.has(Permission.VIEW_REPORTS)) {
            completeness = reports.gst(c.getId(), quarterStart(), null).completenessPercent();
        }
        return new AccountantDtos.ClientDto(c.getId(), c.getName(), c.getGstin(), c.getCity(), c.getState(), pending,
                awaitingItc, completeness, rel.getLastExportAt(), rel.getStatus(),
                access.permissions().stream().map(Enum::name).sorted().toList());
    }

    /** First day of the current Indian financial-year quarter (Apr–Jun, Jul–Sep, Oct–Dec, Jan–Mar). */
    private LocalDate quarterStart() {
        YearMonth now = YearMonth.now(clock.withZone(ClaimService.INDIA));
        int m = now.getMonthValue();
        int startMonth = ((m - 1) / 3) * 3 + 1;
        return LocalDate.of(now.getYear(), startMonth, 1);
    }
}
