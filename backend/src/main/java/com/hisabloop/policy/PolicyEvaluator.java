package com.hisabloop.policy;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.hisabloop.claim.ClaimRepository;
import com.hisabloop.claim.ClaimStatus;
import com.hisabloop.claim.DuplicateStatus;
import com.hisabloop.claim.ExpenseClaim;
import com.hisabloop.claim.GstinStatus;
import com.hisabloop.claim.GstinValidator;
import com.hisabloop.claim.PolicyStatus;
import com.hisabloop.receipt.Receipt;
import com.hisabloop.receipt.ReceiptRepository;

/**
 * Runs duplicate, GSTIN, category-limit and receipt checks against the company policy, updates
 * the claim's summary flags, and replaces the stored check rows for the claim.
 */
@Service
public class PolicyEvaluator {

    private final ExpensePolicyRepository policies;
    private final PolicyCategoryLimitRepository limits;
    private final ClaimPolicyCheckRepository checks;
    private final ClaimRepository claims;
    private final ReceiptRepository receipts;
    private final Clock clock;

    public PolicyEvaluator(ExpensePolicyRepository policies, PolicyCategoryLimitRepository limits,
            ClaimPolicyCheckRepository checks, ClaimRepository claims, ReceiptRepository receipts, Clock clock) {
        this.policies = policies;
        this.limits = limits;
        this.checks = checks;
        this.claims = claims;
        this.receipts = receipts;
        this.clock = clock;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public List<ClaimPolicyCheck> evaluate(ExpenseClaim claim) {
        ExpensePolicy policy = policies.findByCompanyId(claim.getCompanyId())
                .orElseGet(() -> PolicyDefaults.policy(claim.getCompanyId()));
        List<PolicyCategoryLimit> companyLimits = limits.findByCompanyIdOrderByCategoryCodeAscRoleAsc(
                claim.getCompanyId());
        List<Receipt> claimReceipts = receipts.findByClaimIdOrderByCreatedAtAsc(claim.getId());
        Instant now = clock.instant();

        List<ClaimPolicyCheck> results = new ArrayList<>();
        results.add(checkDuplicate(claim, policy, claimReceipts, now));
        results.add(checkGstin(claim, policy));
        results.add(checkCategoryLimit(claim, companyLimits));
        results.add(checkReceipt(claim, policy, claimReceipts));

        boolean violation = results.stream().anyMatch(r -> r.getResult() == CheckResult.FAIL
                && (r.getCheckType() == CheckType.CATEGORY_LIMIT || r.getCheckType() == CheckType.RECEIPT));
        boolean warning = results.stream().anyMatch(r -> r.getResult() != CheckResult.PASS);
        claim.setPolicyStatus(violation ? PolicyStatus.VIOLATION : warning ? PolicyStatus.WARNING : PolicyStatus.OK);

        checks.deleteByClaimId(claim.getId());
        for (ClaimPolicyCheck c : results) {
            c.setCompanyId(claim.getCompanyId());
            c.setClaimId(claim.getId());
            c.setEvaluatedAt(now);
        }
        return checks.saveAll(results);
    }

    ClaimPolicyCheck checkDuplicate(ExpenseClaim claim, ExpensePolicy policy, List<Receipt> claimReceipts,
            Instant now) {
        if (claim.getDuplicateStatus() == DuplicateStatus.NOT_DUPLICATE) {
            return result(CheckType.DUPLICATE, CheckResult.PASS, false,
                    "Possible duplicate was reviewed and marked as not a duplicate");
        }
        if (claim.getDuplicateStatus() == DuplicateStatus.CONFIRMED_DUPLICATE) {
            return result(CheckType.DUPLICATE, CheckResult.FAIL, true, "Confirmed duplicate of another claim");
        }
        if (!policy.isDuplicateDetectionEnabled()) {
            claim.setDuplicateStatus(DuplicateStatus.NONE);
            claim.setDuplicateOfClaimId(null);
            return result(CheckType.DUPLICATE, CheckResult.PASS, false, "Duplicate detection is disabled by policy");
        }

        // 1. Identical receipt file (checksum) uploaded on another claim within the window.
        Instant since = now.minus(policy.getDuplicateWindowDays(), ChronoUnit.DAYS);
        for (Receipt r : claimReceipts) {
            List<Receipt> same = receipts.findSameChecksum(claim.getCompanyId(), r.getSha256(), claim.getId(), since);
            Optional<ExpenseClaim> other = same.stream()
                    // only an earlier upload makes this one the duplicate
                    .filter(s -> r.getCreatedAt() == null || !s.getCreatedAt().isAfter(r.getCreatedAt()))
                    .map(s -> claims.findById(s.getClaimId()).orElse(null))
                    .filter(c -> c != null && c.getStatus() != ClaimStatus.REJECTED)
                    .findFirst();
            if (other.isPresent()) {
                claim.setDuplicateStatus(DuplicateStatus.SUSPECTED);
                claim.setDuplicateOfClaimId(other.get().getId());
                return result(CheckType.DUPLICATE, CheckResult.FAIL, true,
                        "Same receipt file (SHA-256 match) already submitted on claim " + other.get().getReference());
            }
        }

        // 2. Same vendor + amount + date. Vendor alone is never treated as a duplicate.
        if (claim.getVendorName() != null && claim.getReceiptDate() != null && claim.getTotalAmount() != null
                && claim.getTotalAmount().signum() > 0) {
            List<ExpenseClaim> matches = claims.findPotentialDuplicates(claim.getCompanyId(), claim.getId(),
                    claim.getVendorName().trim(), claim.getTotalAmount(), claim.getReceiptDate(), ClaimStatus.REJECTED);
            Optional<ExpenseClaim> earlier = matches.stream()
                    .filter(c -> c.getDuplicateStatus() != DuplicateStatus.CONFIRMED_DUPLICATE)
                    .filter(c -> c.getCreatedAt() == null || claim.getCreatedAt() == null
                            || !c.getCreatedAt().isAfter(claim.getCreatedAt()))
                    .findFirst();
            if (earlier.isPresent()) {
                claim.setDuplicateStatus(DuplicateStatus.SUSPECTED);
                claim.setDuplicateOfClaimId(earlier.get().getId());
                return result(CheckType.DUPLICATE, CheckResult.FAIL, true,
                        "Same vendor, amount and date as claim " + earlier.get().getReference());
            }
        }

        claim.setDuplicateStatus(DuplicateStatus.NONE);
        claim.setDuplicateOfClaimId(null);
        return result(CheckType.DUPLICATE, CheckResult.PASS, false, "No duplicate receipt or matching claim found");
    }

    static ClaimPolicyCheck checkGstin(ExpenseClaim claim, ExpensePolicy policy) {
        String gstin = GstinValidator.normalise(claim.getVendorGstin());
        claim.setVendorGstin(gstin);
        boolean gstCharged = claim.getGstAmount() != null && claim.getGstAmount().signum() > 0;
        if (!policy.isGstinValidationEnabled()) {
            claim.setGstinStatus(GstinStatus.NOT_CHECKED);
            return result(CheckType.GSTIN, CheckResult.PASS, false, "GSTIN validation is disabled by policy");
        }
        if (gstin == null) {
            if (gstCharged) {
                claim.setGstinStatus(GstinStatus.MISSING);
                return result(CheckType.GSTIN, CheckResult.WARN, false,
                        "GST is charged but no supplier GSTIN was captured; input tax credit may not be claimable");
            }
            claim.setGstinStatus(GstinStatus.NOT_APPLICABLE);
            return result(CheckType.GSTIN, CheckResult.PASS, false, "No GST charged; GSTIN not required");
        }
        if (GstinValidator.isValidFormat(gstin)) {
            claim.setGstinStatus(GstinStatus.VALID);
            return result(CheckType.GSTIN, CheckResult.PASS, false,
                    "GSTIN format is valid (format check only; registration not verified)");
        }
        claim.setGstinStatus(GstinStatus.INVALID);
        return result(CheckType.GSTIN, CheckResult.WARN, false, "GSTIN " + gstin + " does not match the GSTIN format");
    }

    static ClaimPolicyCheck checkCategoryLimit(ExpenseClaim claim, List<PolicyCategoryLimit> companyLimits) {
        String role = claim.getEmployee() == null ? null : claim.getEmployee().getRole().name();
        Optional<PolicyCategoryLimit> limit = findLimit(companyLimits, claim.getCategoryCode(), role);
        if (limit.isEmpty()) {
            return result(CheckType.CATEGORY_LIMIT, CheckResult.PASS, false, "No limit configured for this category");
        }
        BigDecimal cap = limit.get().getPerClaimLimit();
        BigDecimal total = claim.getTotalAmount() == null ? BigDecimal.ZERO : claim.getTotalAmount();
        if (total.compareTo(cap) > 0) {
            return result(CheckType.CATEGORY_LIMIT, CheckResult.FAIL, true,
                    "Exceeds category limit of ₹" + cap.toPlainString() + " by ₹"
                            + total.subtract(cap).toPlainString());
        }
        return result(CheckType.CATEGORY_LIMIT, CheckResult.PASS, false,
                "Within category limit of ₹" + cap.toPlainString());
    }

    static Optional<PolicyCategoryLimit> findLimit(List<PolicyCategoryLimit> all, String category, String role) {
        Optional<PolicyCategoryLimit> specific = all.stream()
                .filter(l -> l.getCategoryCode().equals(category) && l.getRole().equals(role))
                .findFirst();
        if (specific.isPresent()) {
            return specific;
        }
        return all.stream()
                .filter(l -> l.getCategoryCode().equals(category)
                        && PolicyCategoryLimit.ALL_ROLES.equals(l.getRole()))
                .findFirst();
    }

    static ClaimPolicyCheck checkReceipt(ExpenseClaim claim, ExpensePolicy policy, List<Receipt> claimReceipts) {
        boolean hasReceipt = !claimReceipts.isEmpty();
        BigDecimal threshold = policy.getReceiptRequiredAbove();
        if (hasReceipt) {
            return result(CheckType.RECEIPT, CheckResult.PASS, false, "Receipt attached");
        }
        if (threshold != null && claim.getTotalAmount() != null && claim.getTotalAmount().compareTo(threshold) > 0) {
            return result(CheckType.RECEIPT, CheckResult.FAIL, true,
                    "No receipt attached; policy requires a receipt above ₹" + threshold.toPlainString());
        }
        return result(CheckType.RECEIPT, CheckResult.WARN, false, "No receipt attached (text claim)");
    }

    private static ClaimPolicyCheck result(CheckType type, CheckResult result, boolean blocking, String message) {
        ClaimPolicyCheck c = new ClaimPolicyCheck();
        c.setCheckType(type);
        c.setResult(result);
        c.setBlocking(blocking);
        c.setMessage(message.length() > 500 ? message.substring(0, 500) : message);
        return c;
    }
}
