package com.hisabloop.approval;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import com.hisabloop.claim.ClaimDtos;

public final class ApprovalDtos {

    private ApprovalDtos() {
    }

    public record ApproveRequest(@Size(max = 1000) String comment, boolean acknowledgeBlockingIssues) {
    }

    public record BulkApproveRequest(@NotEmpty @Size(max = 100) List<String> claimIds,
            @Size(max = 1000) String comment) {
    }

    public record PendingApproval(ClaimDtos.ClaimSummary claim, int level, int requiredLevels,
            List<ClaimDtos.PolicyCheckDto> issues, boolean hasBlockingIssues, String firstReceiptId,
            boolean clarificationRequested) {
    }

    public record BulkItemResult(String claimId, String reference, String outcome, String message) {
    }

    public record BulkResult(int approved, int skipped, int failed, List<BulkItemResult> results) {
    }
}
