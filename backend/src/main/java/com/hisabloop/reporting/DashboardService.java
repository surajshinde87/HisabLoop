package com.hisabloop.reporting;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeSet;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hisabloop.approval.ApprovalRules;
import com.hisabloop.claim.ClaimFilter;
import com.hisabloop.claim.ClaimMapper;
import com.hisabloop.claim.ClaimQueryService;
import com.hisabloop.claim.ClaimRepository;
import com.hisabloop.claim.ClaimService;
import com.hisabloop.claim.ClaimSpecifications;
import com.hisabloop.claim.ClaimStatus;
import com.hisabloop.claim.ExpenseClaim;
import com.hisabloop.company.CompanyAccess;
import com.hisabloop.company.CompanyAccessService;
import com.hisabloop.company.Permission;
import com.hisabloop.policy.CheckResult;
import com.hisabloop.policy.ClaimPolicyCheck;
import com.hisabloop.policy.ClaimPolicyCheckRepository;
import com.hisabloop.policy.ExpenseCategory;
import com.hisabloop.policy.ExpenseCategoryRepository;
import com.hisabloop.claim.ItcStatus;
import com.hisabloop.reimbursement.ReimbursementBatch;
import com.hisabloop.reimbursement.ReimbursementBatchRepository;

/**
 * Dashboard aggregates computed from the same claim rows the claims list shows, scoped to what the
 * caller may see. Month boundaries use Indian business dates (receipt date / IST payment date).
 */
@Service
public class DashboardService {

    private final CompanyAccessService accessService;
    private final ClaimRepository claims;
    private final ClaimQueryService claimQueries;
    private final ClaimPolicyCheckRepository checks;
    private final ExpenseCategoryRepository categories;
    private final ReimbursementBatchRepository batches;
    private final Clock clock;

    public DashboardService(CompanyAccessService accessService, ClaimRepository claims,
            ClaimQueryService claimQueries, ClaimPolicyCheckRepository checks, ExpenseCategoryRepository categories,
            ReimbursementBatchRepository batches, Clock clock) {
        this.accessService = accessService;
        this.claims = claims;
        this.claimQueries = claimQueries;
        this.checks = checks;
        this.categories = categories;
        this.batches = batches;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public ReportDtos.Dashboard dashboard(String companyId, YearMonth month) {
        CompanyAccess access = accessService.require(companyId, Permission.VIEW_CLAIMS);
        YearMonth ym = month != null ? month : YearMonth.now(clock.withZone(ClaimService.INDIA));
        LocalDate from = ym.atDay(1);
        LocalDate to = ym.atEndOfMonth();

        List<ExpenseClaim> visible = claims.findAll(ClaimSpecifications.build(access,
                new ClaimFilter(null, List.of(), null, null, null, null, null, false, null)));

        Predicate<ExpenseClaim> isSpend = c -> Spend.SPEND_STATUSES.contains(c.getStatus());
        List<ExpenseClaim> monthSpend = visible.stream().filter(isSpend).filter(c -> inMonth(c.getReceiptDate(), ym))
                .toList();
        List<ExpenseClaim> prevSpend = visible.stream().filter(isSpend)
                .filter(c -> inMonth(c.getReceiptDate(), ym.minusMonths(1))).toList();

        BigDecimal total = sum(monthSpend);
        BigDecimal prevTotal = sum(prevSpend);
        BigDecimal change = prevTotal.signum() == 0 ? null
                : total.subtract(prevTotal).multiply(BigDecimal.valueOf(100)).divide(prevTotal, 1, RoundingMode.HALF_UP);

        List<ExpenseClaim> pending = byStatus(visible, ClaimStatus.PENDING_APPROVAL);
        List<ExpenseClaim> approved = visible.stream()
                .filter(c -> c.getStatus() == ClaimStatus.APPROVED && c.getBatchId() == null).toList();
        List<ExpenseClaim> inBatch = byStatus(visible, ClaimStatus.IN_BATCH);
        List<ExpenseClaim> paidInMonth = visible.stream()
                .filter(c -> c.getStatus() == ClaimStatus.PAID && c.getPaidAt() != null
                        && inMonth(c.getPaidAt().atZone(ClaimService.INDIA).toLocalDate(), ym))
                .toList();
        List<ExpenseClaim> flagged = visible.stream()
                .filter(c -> c.isFlagged() && c.getStatus() != ClaimStatus.REJECTED && c.getStatus() != ClaimStatus.PAID)
                .sorted(Comparator.comparing(ExpenseClaim::getClaimNumber).reversed())
                .toList();

        // Categories
        Map<String, String> labels = categories.findAllByOrderBySortOrder().stream()
                .collect(Collectors.toMap(ExpenseCategory::getCode, ExpenseCategory::getLabel, (a, b) -> a,
                        LinkedHashMap::new));
        Map<String, List<ExpenseClaim>> byCat = monthSpend.stream()
                .collect(Collectors.groupingBy(ExpenseClaim::getCategoryCode));
        List<ReportDtos.CategorySpend> byCategory = new ArrayList<>();
        for (Map.Entry<String, List<ExpenseClaim>> e : byCat.entrySet()) {
            BigDecimal amt = sum(e.getValue());
            BigDecimal pct = total.signum() == 0 ? BigDecimal.ZERO
                    : amt.multiply(BigDecimal.valueOf(100)).divide(total, 1, RoundingMode.HALF_UP);
            byCategory.add(new ReportDtos.CategorySpend(e.getKey(), labels.getOrDefault(e.getKey(), e.getKey()), amt,
                    e.getValue().size(), pct));
        }
        byCategory.sort(Comparator.comparing(ReportDtos.CategorySpend::amount).reversed());

        // Six-month trend split by team
        TreeSet<String> teams = new TreeSet<>();
        List<ReportDtos.MonthSpend> trend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth m = ym.minusMonths(i);
            List<ExpenseClaim> mc = visible.stream().filter(isSpend).filter(c -> inMonth(c.getReceiptDate(), m))
                    .toList();
            Map<String, BigDecimal> byTeam = new LinkedHashMap<>();
            for (ExpenseClaim c : mc) {
                String team = teamName(c);
                teams.add(team);
                byTeam.merge(team, c.getTotalAmount(), BigDecimal::add);
            }
            trend.add(new ReportDtos.MonthSpend(m.toString(),
                    m.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), sum(mc), byTeam));
        }

        BigDecimal gstCaptured = monthSpend.stream().map(ExpenseClaim::getGstAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal itcEligible = monthSpend.stream().filter(c -> c.getItcStatus() == ItcStatus.ELIGIBLE)
                .map(ExpenseClaim::getGstAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        List<ReportDtos.FlaggedClaim> flaggedCards = flagged.stream().limit(4).map(this::flaggedCard).toList();
        List<com.hisabloop.claim.ClaimDtos.ClaimSummary> recent = visible.stream()
                .filter(c -> c.getStatus() != ClaimStatus.DRAFT)
                .sorted(Comparator.comparing(ExpenseClaim::getClaimNumber).reversed())
                .limit(5).map(ClaimMapper::summary).toList();

        return new ReportDtos.Dashboard(ym.toString(), from, to,
                new ReportDtos.Amount(monthSpend.size(), total), prevTotal, change,
                amount(pending), amount(approved), amount(inBatch), amount(paidInMonth),
                averageHours(visible, ym), averageHours(visible, ym.minusMonths(1)),
                amount(flagged), byCategory, trend, new ArrayList<>(teams), gstCaptured, itcEligible,
                flaggedCards, recent);
    }

    /** Badge counts for the sidebar. */
    @Transactional(readOnly = true)
    public ReportDtos.NavCounts navCounts(String companyId) {
        CompanyAccess access = accessService.require(companyId);
        long claimCount = 0;
        if (access.has(Permission.VIEW_CLAIMS)) {
            claimCount = claims.count(ClaimSpecifications.build(access,
                    new ClaimFilter(null, List.of(), null, null, null, null, null, false, null)));
        }
        long approvals = 0;
        if (access.has(Permission.APPROVE_CLAIMS)) {
            approvals = claims.findByCompanyAndStatus(companyId, ClaimStatus.PENDING_APPROVAL).stream()
                    .filter(c -> ApprovalRules.canDecide(access, c, claimQueries.priorApproverIds(c)))
                    .count();
        }
        long openBatches = access.has(Permission.VIEW_REIMBURSEMENTS)
                ? batches.countByCompanyIdAndStatus(companyId, ReimbursementBatch.CREATED) : 0;
        return new ReportDtos.NavCounts(claimCount, approvals, openBatches);
    }

    private ReportDtos.FlaggedClaim flaggedCard(ExpenseClaim c) {
        List<ClaimPolicyCheck> failing = checks.findByClaimIdOrderByCheckType(c.getId()).stream()
                .filter(k -> k.getResult() != CheckResult.PASS)
                .sorted(Comparator.comparing(ClaimPolicyCheck::isBlocking).reversed())
                .toList();
        String type;
        String title;
        String message;
        if (!failing.isEmpty()) {
            ClaimPolicyCheck k = failing.get(0);
            type = k.getCheckType().name();
            message = k.getMessage();
            title = switch (k.getCheckType()) {
                case DUPLICATE -> "Duplicate Receipt Detected";
                case GSTIN -> c.getGstinStatus() == com.hisabloop.claim.GstinStatus.INVALID ? "Invalid GSTIN Format"
                        : "Missing Supplier GSTIN";
                case CATEGORY_LIMIT -> "Exceeds Category Limit";
                case RECEIPT -> "Receipt Required";
            };
        } else {
            type = "FLAG";
            title = "Needs review";
            message = "Flagged for review";
        }
        return new ReportDtos.FlaggedClaim(ClaimMapper.summary(c), type, title, message);
    }

    private static BigDecimal averageHours(Collection<ExpenseClaim> list, YearMonth ym) {
        List<Duration> durations = list.stream()
                .filter(c -> c.getApprovedAt() != null && c.getSubmittedAt() != null)
                .filter(c -> inMonth(c.getApprovedAt().atZone(ClaimService.INDIA).toLocalDate(), ym))
                .map(c -> Duration.between(c.getSubmittedAt(), c.getApprovedAt()))
                .filter(d -> !d.isNegative())
                .toList();
        if (durations.isEmpty()) {
            return null;
        }
        long totalMinutes = durations.stream().mapToLong(Duration::toMinutes).sum();
        return BigDecimal.valueOf(totalMinutes).divide(BigDecimal.valueOf(60L * durations.size()), 1,
                RoundingMode.HALF_UP);
    }

    static boolean inMonth(LocalDate date, YearMonth ym) {
        return date != null && YearMonth.from(date).equals(ym);
    }

    static String teamName(ExpenseClaim c) {
        return c.getEmployee().getTeam() == null ? "Unassigned" : c.getEmployee().getTeam().getName();
    }

    private static List<ExpenseClaim> byStatus(List<ExpenseClaim> list, ClaimStatus status) {
        return list.stream().filter(c -> c.getStatus() == status).toList();
    }

    static BigDecimal sum(Collection<ExpenseClaim> list) {
        return list.stream().map(ExpenseClaim::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private static ReportDtos.Amount amount(Collection<ExpenseClaim> list) {
        return new ReportDtos.Amount(list.size(), sum(list));
    }
}
