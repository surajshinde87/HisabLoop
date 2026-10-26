package com.hisabloop.company;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class CompanyDtos {

    private CompanyDtos() {
    }

    public record SubscriptionDto(String plan, int seats, BigDecimal pricePerUser, String status,
            boolean billingConfigured) {
    }

    public record CompanyDto(String id, String name, String legalName, String gstin, String email, String phone,
            String city, String state, String plan, String status, Instant createdAt, long activeMembers,
            SubscriptionDto subscription) {
    }

    public record CreateCompanyRequest(@NotBlank @Size(max = 160) String name, @Size(max = 200) String legalName,
            @Size(max = 15) String gstin, @Email @Size(max = 190) String email, @Size(max = 20) String phone,
            @Size(max = 80) String city, @Size(max = 80) String state,
            @Pattern(regexp = "STARTER|GROWTH|BUSINESS") String plan) {
    }

    public record UpdateCompanyRequest(@Size(max = 160) String name, @Size(max = 200) String legalName,
            @Size(max = 15) String gstin, @Email @Size(max = 190) String email, @Size(max = 20) String phone,
            @Size(max = 80) String city, @Size(max = 80) String state,
            @Pattern(regexp = "STARTER|GROWTH|BUSINESS") String plan) {
    }

    public record PlanDto(String code, BigDecimal pricePerUserMonthly, String currency) {
    }
}
