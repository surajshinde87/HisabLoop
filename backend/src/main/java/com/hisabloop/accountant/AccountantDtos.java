package com.hisabloop.accountant;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import com.hisabloop.reporting.ReportDtos;

public final class AccountantDtos {

    private AccountantDtos() {
    }

    public record ClientDto(String companyId, String companyName, String gstin, String city, String state,
            long pendingClaims, long claimsAwaitingItcReview, BigDecimal gstCompletenessPercent, Instant lastExportAt,
            String accessStatus, List<String> permissions) {
    }

    public record ClientSummary(ClientDto client, Map<String, Long> claimsByStatus,
            List<ReportDtos.GstMonth> gstMonths, BigDecimal gstTotal, BigDecimal itcMarkedEligible,
            List<ReportDtos.ExportJobDto> recentExports) {
    }

    public record CaPartnerDto(String relationshipId, String caUserId, String name, String email, String firmName,
            String status, boolean canViewClaims, boolean canViewReports, boolean canExport, boolean canViewAudit,
            boolean canReviewItc, Instant lastExportAt, Instant grantedAt) {
    }

    public record GrantRequest(@NotBlank @Email @Size(max = 190) String email, Boolean canViewAudit,
            Boolean canExport, Boolean canReviewItc) {
    }
}
