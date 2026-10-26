package com.hisabloop.claim;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

import com.hisabloop.common.error.ApiException;
import com.hisabloop.common.persistence.BaseEntity;
import com.hisabloop.company.Membership;

@Getter
@Setter
@Entity
@Table(name = "expense_claims")
public class ExpenseClaim extends BaseEntity {

    @Column(name = "company_id", nullable = false, length = 36, updatable = false)
    private String companyId;

    @Column(name = "claim_number", nullable = false, updatable = false)
    private int claimNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_membership_id", nullable = false, updatable = false)
    private Membership employee;

    @Column(name = "category_code", nullable = false, length = 40)
    private String categoryCode;

    @Column(name = "vendor_name", length = 160)
    private String vendorName;

    @Column(name = "receipt_date")
    private LocalDate receiptDate;

    @Column(name = "total_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "taxable_amount", precision = 14, scale = 2)
    private BigDecimal taxableAmount;

    @Column(name = "gst_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal gstAmount = BigDecimal.ZERO;

    @Column(name = "cgst_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal cgstAmount = BigDecimal.ZERO;

    @Column(name = "sgst_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal sgstAmount = BigDecimal.ZERO;

    @Column(name = "igst_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal igstAmount = BigDecimal.ZERO;

    @Column(name = "vendor_gstin", length = 15)
    private String vendorGstin;

    @Column(name = "payment_mode", length = 30)
    private String paymentMode;

    @Column(length = 500)
    private String description;

    @Column(name = "raw_text", length = 500)
    private String rawText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, updatable = false, columnDefinition = "varchar(20)")
    private ClaimSource source;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, columnDefinition = "varchar(20)")
    private ClaimStatus status = ClaimStatus.DRAFT;

    @Column(name = "has_receipt", nullable = false)
    private boolean hasReceipt;

    @Column(name = "required_approval_levels", nullable = false)
    private int requiredApprovalLevels = 1;

    @Column(name = "approvals_completed", nullable = false)
    private int approvalsCompleted;

    @Enumerated(EnumType.STRING)
    @Column(name = "gstin_status", nullable = false, length = 20, columnDefinition = "varchar(20)")
    private GstinStatus gstinStatus = GstinStatus.NOT_APPLICABLE;

    @Enumerated(EnumType.STRING)
    @Column(name = "duplicate_status", nullable = false, length = 30, columnDefinition = "varchar(30)")
    private DuplicateStatus duplicateStatus = DuplicateStatus.NONE;

    @Column(name = "duplicate_of_claim_id", length = 36)
    private String duplicateOfClaimId;

    @Enumerated(EnumType.STRING)
    @Column(name = "policy_status", nullable = false, length = 20, columnDefinition = "varchar(20)")
    private PolicyStatus policyStatus = PolicyStatus.OK;

    @Column(name = "clarification_requested", nullable = false)
    private boolean clarificationRequested;

    @Enumerated(EnumType.STRING)
    @Column(name = "itc_status", nullable = false, length = 20, columnDefinition = "varchar(20)")
    private ItcStatus itcStatus = ItcStatus.UNREVIEWED;

    @Column(name = "itc_note", length = 500)
    private String itcNote;

    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    @Column(name = "batch_id", length = 36)
    private String batchId;

    @Column(name = "confirmed_at")
    private Instant confirmedAt;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "rejected_at")
    private Instant rejectedAt;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Version
    @Column(nullable = false)
    private int version;

    public String getReference() {
        return formatReference(claimNumber);
    }

    public static String formatReference(int number) {
        return "HL-" + number;
    }

    /**
     * The only way to change status. Rejects transitions the state machine does not allow; the
     * caller records the matching audit event in the same transaction.
     */
    public ClaimStatus transitionTo(ClaimStatus target) {
        ClaimStatus previous = this.status;
        if (!previous.canTransitionTo(target)) {
            throw ApiException.conflict("invalid_transition",
                    "Claim " + getReference() + " cannot move from " + previous + " to " + target);
        }
        this.status = target;
        return previous;
    }

    public boolean isFlagged() {
        return duplicateStatus == DuplicateStatus.SUSPECTED || duplicateStatus == DuplicateStatus.CONFIRMED_DUPLICATE
                || gstinStatus == GstinStatus.MISSING || gstinStatus == GstinStatus.INVALID
                || policyStatus == PolicyStatus.VIOLATION;
    }
}
