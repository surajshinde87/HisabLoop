package com.hisabloop.claim;

import java.util.ArrayList;
import java.util.List;

import com.hisabloop.company.Membership;

public final class ClaimMapper {

    private ClaimMapper() {
    }

    public static ClaimDtos.EmployeeRef employee(Membership m) {
        if (m == null) {
            return null;
        }
        return new ClaimDtos.EmployeeRef(m.getId(), m.getUser().getId(), m.getUser().getFullName(),
                m.getTeam() == null ? null : m.getTeam().getName(), m.getDesignation());
    }

    public static List<String> flags(ExpenseClaim c) {
        List<String> flags = new ArrayList<>();
        if (c.getDuplicateStatus() == DuplicateStatus.SUSPECTED
                || c.getDuplicateStatus() == DuplicateStatus.CONFIRMED_DUPLICATE) {
            flags.add("DUPLICATE");
        }
        if (c.getGstinStatus() == GstinStatus.MISSING) {
            flags.add("MISSING_GSTIN");
        }
        if (c.getGstinStatus() == GstinStatus.INVALID) {
            flags.add("INVALID_GSTIN");
        }
        if (c.getPolicyStatus() == PolicyStatus.VIOLATION) {
            flags.add("POLICY_VIOLATION");
        }
        if (!c.isHasReceipt()) {
            flags.add("NO_RECEIPT");
        }
        if (c.isClarificationRequested()) {
            flags.add("CLARIFICATION_REQUESTED");
        }
        return flags;
    }

    public static ClaimDtos.ClaimSummary summary(ExpenseClaim c) {
        return new ClaimDtos.ClaimSummary(c.getId(), c.getReference(), c.getClaimNumber(), employee(c.getEmployee()),
                c.getVendorName() != null ? c.getVendorName() : c.getDescription(), c.getReceiptDate(),
                c.getCategoryCode(), c.getTotalAmount(), c.getGstAmount(), c.getStatus(), c.getSource(),
                c.isHasReceipt(), flags(c), c.getBatchId(), c.getCreatedAt(), c.getSubmittedAt());
    }
}
