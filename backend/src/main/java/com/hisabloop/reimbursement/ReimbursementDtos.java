package com.hisabloop.reimbursement;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import com.hisabloop.claim.ClaimDtos;

public final class ReimbursementDtos {

    private ReimbursementDtos() {
    }

    public record CreateBatchRequest(@NotEmpty @Size(max = 500) List<String> claimIds, @Size(max = 500) String notes) {
    }

    public record MarkPaidRequest(
            @NotNull @Pattern(regexp = "NEFT|IMPS|RTGS|UPI_MANUAL|CHEQUE|CASH") String method,
            @NotBlank @Size(max = 100) String reference,
            @NotNull @PastOrPresent LocalDate paidOn) {
    }

    public record EmployeeTotal(String membershipId, String name, String team, int claimCount, BigDecimal amount) {
    }

    public record PaymentDto(String method, String reference, BigDecimal amount, LocalDate paidOn,
            String recordedByName, Instant recordedAt) {
    }

    public record BatchSummary(String id, String reference, String status, BigDecimal totalAmount, int claimCount,
            int employeeCount, String createdByName, Instant createdAt, Instant paidAt, String notes) {
    }

    public record BatchDetail(BatchSummary batch, List<EmployeeTotal> employees, List<ClaimDtos.ClaimSummary> claims,
            PaymentDto payment) {
    }

    public record EligibleClaims(List<ClaimDtos.ClaimSummary> claims, BigDecimal totalAmount) {
    }

    public record PayoutCapabilities(boolean upiPayoutAvailable, String upiPayoutMessage) {
    }
}
