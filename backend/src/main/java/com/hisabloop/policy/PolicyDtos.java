package com.hisabloop.policy;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class PolicyDtos {

    private PolicyDtos() {
    }

    public record CategoryLimitDto(
            @NotBlank @Size(max = 40) String categoryCode,
            @NotBlank @Pattern(regexp = "ALL|ADMIN|FINANCE|MANAGER|EMPLOYEE") String role,
            @NotNull @DecimalMin("1.00") @Digits(integer = 12, fraction = 2) BigDecimal perClaimLimit) {
    }

    public record PolicyDto(
            BigDecimal twoLevelApprovalAbove,
            boolean duplicateDetectionEnabled,
            int duplicateWindowDays,
            boolean gstinValidationEnabled,
            BigDecimal receiptRequiredAbove,
            List<CategoryLimitDto> categoryLimits,
            Instant updatedAt,
            String updatedByName,
            boolean canEdit) {
    }

    public record UpdatePolicyRequest(
            @NotNull @DecimalMin("0.00") @Digits(integer = 12, fraction = 2) BigDecimal twoLevelApprovalAbove,
            @NotNull Boolean duplicateDetectionEnabled,
            @NotNull @Min(1) @Max(730) Integer duplicateWindowDays,
            @NotNull Boolean gstinValidationEnabled,
            @DecimalMin("0.00") @Digits(integer = 12, fraction = 2) BigDecimal receiptRequiredAbove,
            @NotNull @Size(max = 100) List<@Valid CategoryLimitDto> categoryLimits) {
    }

    public record CategoryDto(String code, String label, String icon) {
    }
}
