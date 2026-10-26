package com.hisabloop.receipt.ocr;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.hisabloop.receipt.ProcessingStatus;

/** Fields suggested by an OCR/AI provider. Every value is a suggestion until the employee confirms. */
public record ReceiptExtraction(
        ProcessingStatus status,
        String provider,
        BigDecimal confidence,
        String vendorName,
        LocalDate receiptDate,
        BigDecimal totalAmount,
        BigDecimal taxableAmount,
        BigDecimal gstAmount,
        BigDecimal cgstAmount,
        BigDecimal sgstAmount,
        BigDecimal igstAmount,
        String vendorGstin,
        String paymentMode,
        String suggestedCategory,
        String description,
        String message) {

    public static ReceiptExtraction needsReview(String provider, String message) {
        return new ReceiptExtraction(ProcessingStatus.NEEDS_REVIEW, provider, BigDecimal.ZERO, null, null, null, null,
                null, null, null, null, null, null, null, null, message);
    }
}
