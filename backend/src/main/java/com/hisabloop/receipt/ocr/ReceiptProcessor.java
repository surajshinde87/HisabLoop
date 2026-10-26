package com.hisabloop.receipt.ocr;

/**
 * OCR/AI extraction provider. Implementations must not pretend to have read a receipt they could
 * not process: return {@link ReceiptExtraction#needsReview} instead.
 */
public interface ReceiptProcessor {

    String name();

    ReceiptExtraction process(byte[] content, String contentType, String originalFilename);
}
