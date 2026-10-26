package com.hisabloop.reporting;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import com.hisabloop.claim.ClaimDtos;

public final class ReportDtos {

    private ReportDtos() {
    }

    public record Amount(long count, BigDecimal amount) {
    }

    public record CategorySpend(String code, String label, BigDecimal amount, long count, BigDecimal percent) {
    }

    public record MonthSpend(String month, String label, BigDecimal total, Map<String, BigDecimal> byTeam) {
    }

    public record FlaggedClaim(ClaimDtos.ClaimSummary claim, String issueType, String issueTitle, String issueMessage) {
    }

    public record Dashboard(
            String month,
            LocalDate from,
            LocalDate to,
            Amount totalSpend,
            BigDecimal previousMonthSpend,
            BigDecimal spendChangePercent,
            Amount pendingApproval,
            Amount approvedAwaitingPayment,
            Amount inBatch,
            Amount paidThisMonth,
            BigDecimal averageApprovalHours,
            BigDecimal previousAverageApprovalHours,
            Amount flagged,
            List<CategorySpend> byCategory,
            List<MonthSpend> monthlyTrend,
            List<String> teams,
            BigDecimal gstCaptured,
            BigDecimal itcMarkedEligible,
            List<FlaggedClaim> flaggedClaims,
            List<ClaimDtos.ClaimSummary> recentClaims) {
    }

    public record NavCounts(long claims, long approvals, long openBatches) {
    }

    public record SpendRow(String key, String label, long claimCount, BigDecimal totalAmount, BigDecimal gstAmount) {
    }

    public record SpendReport(String groupBy, LocalDate from, LocalDate to, List<SpendRow> rows, BigDecimal total,
            long claimCount, String basis) {
    }

    public record GstRow(String month, String claimId, String claimReference, LocalDate receiptDate, String vendor,
            String gstin, String gstinStatus, BigDecimal taxableValue, BigDecimal cgst, BigDecimal sgst, BigDecimal igst,
            BigDecimal totalGst, BigDecimal invoiceTotal, String itcStatus, List<String> completenessIssues) {
    }

    public record GstMonth(String month, BigDecimal taxableValue, BigDecimal cgst, BigDecimal sgst, BigDecimal igst,
            BigDecimal totalGst, BigDecimal itcMarkedEligible, long rows, long completeRows) {
    }

    public record GstReport(LocalDate from, LocalDate to, List<GstRow> rows, List<GstMonth> months,
            BigDecimal totalGst, BigDecimal itcMarkedEligible, BigDecimal completenessPercent, String basis) {
    }

    public record ExportJobDto(String id, String reportType, String format, int rowCount, String requestedByName,
            Instant createdAt) {
    }
}
