package com.hisabloop.reporting;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hisabloop.claim.ClaimFilter;
import com.hisabloop.claim.ClaimRepository;
import com.hisabloop.claim.ClaimSpecifications;
import com.hisabloop.claim.ExpenseClaim;
import com.hisabloop.claim.GstinStatus;
import com.hisabloop.claim.ItcStatus;
import com.hisabloop.common.error.ApiException;
import com.hisabloop.company.CompanyAccess;
import com.hisabloop.company.CompanyAccessService;
import com.hisabloop.company.Permission;
import com.hisabloop.policy.ExpenseCategory;
import com.hisabloop.policy.ExpenseCategoryRepository;

/** Spend and GST reports derived directly from claim records. */
@Service
public class ReportService {

    public static final List<String> GROUPS = List.of("category", "team", "employee", "vendor", "month");

    private final CompanyAccessService accessService;
    private final ClaimRepository claims;
    private final ExpenseCategoryRepository categories;

    public ReportService(CompanyAccessService accessService, ClaimRepository claims,
            ExpenseCategoryRepository categories) {
        this.accessService = accessService;
        this.claims = claims;
        this.categories = categories;
    }

    @Transactional(readOnly = true)
    public ReportDtos.SpendReport spend(String companyId, LocalDate from, LocalDate to, String groupBy) {
        CompanyAccess access = accessService.require(companyId, Permission.VIEW_REPORTS);
        return spend(access, from, to, groupBy);
    }

    ReportDtos.SpendReport spend(CompanyAccess access, LocalDate from, LocalDate to, String groupBy) {
        String group = groupBy == null ? "category" : groupBy;
        if (!GROUPS.contains(group)) {
            throw ApiException.badRequest("invalid_group", "groupBy must be one of " + GROUPS);
        }
        validateRange(from, to);
        List<ExpenseClaim> list = load(access, from, to).stream()
                .filter(c -> Spend.SPEND_STATUSES.contains(c.getStatus())).toList();

        Map<String, String> catLabels = categories.findAllByOrderBySortOrder().stream()
                .collect(Collectors.toMap(ExpenseCategory::getCode, ExpenseCategory::getLabel));
        Function<ExpenseClaim, String[]> keyer = switch (group) {
            case "team" -> c -> new String[] {DashboardService.teamName(c), DashboardService.teamName(c)};
            case "employee" -> c -> new String[] {c.getEmployee().getId(), c.getEmployee().getUser().getFullName()};
            case "vendor" -> c -> {
                String v = c.getVendorName() == null ? "(no vendor – text claim)" : c.getVendorName().trim();
                return new String[] {v.toLowerCase(), v};
            };
            case "month" -> c -> {
                String m = c.getReceiptDate() == null ? "unknown" : YearMonth.from(c.getReceiptDate()).toString();
                return new String[] {m, m};
            };
            default -> c -> new String[] {c.getCategoryCode(),
                    catLabels.getOrDefault(c.getCategoryCode(), c.getCategoryCode())};
        };

        Map<String, String> labels = new LinkedHashMap<>();
        Map<String, List<ExpenseClaim>> grouped = new LinkedHashMap<>();
        for (ExpenseClaim c : list) {
            String[] k = keyer.apply(c);
            labels.putIfAbsent(k[0], k[1]);
            grouped.computeIfAbsent(k[0], x -> new ArrayList<>()).add(c);
        }
        List<ReportDtos.SpendRow> rows = new ArrayList<>();
        grouped.forEach((k, v) -> rows.add(new ReportDtos.SpendRow(k, labels.get(k), v.size(), DashboardService.sum(v),
                v.stream().map(ExpenseClaim::getGstAmount).reduce(BigDecimal.ZERO, BigDecimal::add))));
        if ("month".equals(group)) {
            rows.sort(Comparator.comparing(ReportDtos.SpendRow::key));
        } else {
            rows.sort(Comparator.comparing(ReportDtos.SpendRow::totalAmount).reversed());
        }
        return new ReportDtos.SpendReport(group, from, to, rows, DashboardService.sum(list), list.size(),
                Spend.SPEND_BASIS);
    }

    @Transactional(readOnly = true)
    public ReportDtos.GstReport gst(String companyId, LocalDate from, LocalDate to) {
        CompanyAccess access = accessService.require(companyId, Permission.VIEW_REPORTS);
        return gst(access, from, to);
    }

    ReportDtos.GstReport gst(CompanyAccess access, LocalDate from, LocalDate to) {
        validateRange(from, to);
        List<ExpenseClaim> list = load(access, from, to).stream()
                .filter(c -> Spend.GST_STATUSES.contains(c.getStatus()))
                .filter(c -> c.getGstAmount().signum() > 0 || c.getVendorGstin() != null)
                .sorted(Comparator.comparing(ExpenseClaim::getReceiptDate,
                        Comparator.nullsLast(Comparator.naturalOrder())).thenComparing(ExpenseClaim::getClaimNumber))
                .toList();

        List<ReportDtos.GstRow> rows = new ArrayList<>();
        Map<String, List<ReportDtos.GstRow>> byMonth = new TreeMap<>();
        for (ExpenseClaim c : list) {
            List<String> issues = completenessIssues(c);
            String month = c.getReceiptDate() == null ? "unknown" : YearMonth.from(c.getReceiptDate()).toString();
            ReportDtos.GstRow row = new ReportDtos.GstRow(month, c.getId(), c.getReference(), c.getReceiptDate(),
                    c.getVendorName(), c.getVendorGstin(), c.getGstinStatus().name(), c.getTaxableAmount(),
                    c.getCgstAmount(), c.getSgstAmount(), c.getIgstAmount(), c.getGstAmount(), c.getTotalAmount(),
                    c.getItcStatus().name(), issues);
            rows.add(row);
            byMonth.computeIfAbsent(month, k -> new ArrayList<>()).add(row);
        }
        List<ReportDtos.GstMonth> months = new ArrayList<>();
        byMonth.forEach((m, r) -> months.add(new ReportDtos.GstMonth(m,
                sum(r, ReportDtos.GstRow::taxableValue), sum(r, ReportDtos.GstRow::cgst), sum(r, ReportDtos.GstRow::sgst),
                sum(r, ReportDtos.GstRow::igst), sum(r, ReportDtos.GstRow::totalGst),
                sum(r.stream().filter(x -> ItcStatus.ELIGIBLE.name().equals(x.itcStatus())).toList(),
                        ReportDtos.GstRow::totalGst),
                r.size(), r.stream().filter(x -> x.completenessIssues().isEmpty()).count())));
        BigDecimal totalGst = sum(rows, ReportDtos.GstRow::totalGst);
        BigDecimal eligible = sum(rows.stream().filter(x -> ItcStatus.ELIGIBLE.name().equals(x.itcStatus())).toList(),
                ReportDtos.GstRow::totalGst);
        long complete = rows.stream().filter(x -> x.completenessIssues().isEmpty()).count();
        BigDecimal pct = rows.isEmpty() ? BigDecimal.valueOf(100)
                : BigDecimal.valueOf(complete * 100).divide(BigDecimal.valueOf(rows.size()), 1, RoundingMode.HALF_UP);
        return new ReportDtos.GstReport(from, to, rows, months, totalGst, eligible, pct, Spend.GST_BASIS);
    }

    public static List<String> completenessIssues(ExpenseClaim c) {
        List<String> issues = new ArrayList<>();
        if (c.getGstinStatus() == GstinStatus.MISSING) {
            issues.add("MISSING_GSTIN");
        }
        if (c.getGstinStatus() == GstinStatus.INVALID) {
            issues.add("INVALID_GSTIN");
        }
        if (c.getGstAmount().signum() > 0 && c.getTaxableAmount() == null) {
            issues.add("MISSING_TAXABLE_VALUE");
        }
        if (!c.isHasReceipt()) {
            issues.add("NO_RECEIPT");
        }
        if (c.getItcStatus() == ItcStatus.UNREVIEWED) {
            issues.add("ITC_NOT_REVIEWED");
        }
        return issues;
    }

    List<ExpenseClaim> load(CompanyAccess access, LocalDate from, LocalDate to) {
        return claims.findAll(ClaimSpecifications.build(access,
                new ClaimFilter(null, List.of(), null, null, null, from, to, false, null)));
    }

    private static void validateRange(LocalDate from, LocalDate to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw ApiException.badRequest("invalid_range", "'from' must be on or before 'to'");
        }
    }

    private static <T> BigDecimal sum(List<T> rows, Function<T, BigDecimal> f) {
        return rows.stream().map(f).filter(v -> v != null).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
