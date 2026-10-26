package com.hisabloop.receipt.ocr;

/** Used when no OCR provider is configured (production default). */
public class NoOcrReceiptProcessor implements ReceiptProcessor {

    @Override
    public String name() {
        return "none";
    }

    @Override
    public ReceiptExtraction process(byte[] content, String contentType, String originalFilename) {
        return ReceiptExtraction.needsReview(name(),
                "No OCR provider is configured. Enter the receipt details manually.");
    }
}
