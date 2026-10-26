package com.hisabloop.claim;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Request and response bodies for the claims API. */
public final class ClaimDtos {

    private ClaimDtos() {
    }

    public record EmployeeRef(String membershipId, String userId, String name, String team, String designation) {
    }

    public record Ref(String id, String reference) {
    }

    public record ClaimSummary(
            String id,
            String reference,
            int claimNumber,
            EmployeeRef employee,
            String vendorName,
            LocalDate receiptDate,
            String categoryCode,
            BigDecimal totalAmount,
            BigDecimal gstAmount,
            ClaimStatus status,
            ClaimSource source,
            boolean hasReceipt,
            List<String> flags,
            String batchId,
            Instant createdAt,
            Instant submittedAt) {
    }

    public record PolicyCheckDto(String type, String result, boolean blocking, String message) {
    }

    public record ApprovalDto(String id, int level, String approverName, String decision, String comment,
            Instant decidedAt) {
    }

    public record CommentDto(String id, String authorName, String authorUserId, String kind, String body,
            Instant createdAt) {
    }

    public record AuditEntryDto(String id, String action, String actorName, Instant occurredAt,
            String previousStatus, String newStatus, String metadataJson) {
    }

    public record ReceiptDto(String id, String originalFilename, String contentType, long sizeBytes, String sha256,
            String processingStatus, String provider, BigDecimal confidence, String message, Instant uploadedAt,
            Instant processedAt) {
    }

    public record ClaimDetail(
            String id,
            String reference,
            int claimNumber,
            EmployeeRef employee,
            String approverName,
            String categoryCode,
            String vendorName,
            LocalDate receiptDate,
            BigDecimal totalAmount,
            BigDecimal taxableAmount,
            BigDecimal gstAmount,
            BigDecimal cgstAmount,
            BigDecimal sgstAmount,
            BigDecimal igstAmount,
            String vendorGstin,
            GstinStatus gstinStatus,
            String paymentMode,
            String description,
            String rawText,
            ClaimSource source,
            ClaimStatus status,
            boolean hasReceipt,
            int requiredApprovalLevels,
            int approvalsCompleted,
            DuplicateStatus duplicateStatus,
            Ref duplicateOf,
            PolicyStatus policyStatus,
            boolean clarificationRequested,
            ItcStatus itcStatus,
            String itcNote,
            String rejectionReason,
            Ref batch,
            List<String> flags,
            Instant createdAt,
            Instant confirmedAt,
            Instant submittedAt,
            Instant approvedAt,
            Instant rejectedAt,
            Instant paidAt,
            int version,
            List<ReceiptDto> receipts,
            List<PolicyCheckDto> policyChecks,
            List<ApprovalDto> approvals,
            List<CommentDto> comments,
            List<AuditEntryDto> auditTrail,
            List<String> availableActions) {
    }

    public record CreateClaimRequest(
            @Size(max = 160) String vendorName,
            @PastOrPresent LocalDate receiptDate,
            @NotBlank @Size(max = 40) String categoryCode,
            @DecimalMin("0.00") @DecimalMax("10000000.00") @Digits(integer = 12, fraction = 2) BigDecimal totalAmount,
            @DecimalMin("0.00") @Digits(integer = 12, fraction = 2) BigDecimal taxableAmount,
            @DecimalMin("0.00") @Digits(integer = 12, fraction = 2) BigDecimal cgstAmount,
            @DecimalMin("0.00") @Digits(integer = 12, fraction = 2) BigDecimal sgstAmount,
            @DecimalMin("0.00") @Digits(integer = 12, fraction = 2) BigDecimal igstAmount,
            @Size(max = 20) String vendorGstin,
            @Size(max = 30) String paymentMode,
            @Size(max = 500) String description,
            @Pattern(regexp = "WEB|WHATSAPP") String source) {
    }

    public record TextClaimRequest(@NotBlank @Size(max = 500) String text,
            @Pattern(regexp = "WEB|WHATSAPP") String channel) {
    }

    /** Partial update: null fields are left unchanged. */
    public record UpdateClaimRequest(
            @NotNull Integer version,
            @Size(max = 160) String vendorName,
            @PastOrPresent LocalDate receiptDate,
            @Size(max = 40) String categoryCode,
            @DecimalMin("0.00") @DecimalMax("10000000.00") @Digits(integer = 12, fraction = 2) BigDecimal totalAmount,
            @DecimalMin("0.00") @Digits(integer = 12, fraction = 2) BigDecimal taxableAmount,
            @DecimalMin("0.00") @Digits(integer = 12, fraction = 2) BigDecimal cgstAmount,
            @DecimalMin("0.00") @Digits(integer = 12, fraction = 2) BigDecimal sgstAmount,
            @DecimalMin("0.00") @Digits(integer = 12, fraction = 2) BigDecimal igstAmount,
            @Size(max = 20) String vendorGstin,
            @Size(max = 30) String paymentMode,
            @Size(max = 500) String description) {
    }

    public record ReasonRequest(@NotBlank @Size(max = 1000) String reason) {
    }

    public record CommentRequest(@NotBlank @Size(max = 2000) String body,
            @Pattern(regexp = "COMMENT|CLARIFICATION_REQUEST|CLARIFICATION_RESPONSE") String kind) {
    }

    public record DuplicateResolutionRequest(@NotNull Boolean duplicate, @Size(max = 500) String note) {
    }

    public record ItcReviewRequest(@NotNull ItcStatus status, @Size(max = 500) String note) {
    }

    public record ClaimStats(long count, BigDecimal amount) {
    }

    public record ClaimListStats(ClaimStats all, ClaimStats pendingApproval, ClaimStats approved,
            ClaimStats needsAttention) {
    }
}
