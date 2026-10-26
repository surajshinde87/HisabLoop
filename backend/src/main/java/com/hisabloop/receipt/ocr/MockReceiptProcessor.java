package com.hisabloop.receipt.ocr;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Locale;

import com.hisabloop.receipt.ProcessingStatus;

/**
 * Development-only provider. It does NOT read images: it recognises the bundled sample receipts
 * (frontend/public/sample-receipts, backend demo/receipts) by file name and returns their known
 * values, so the end-to-end workflow can be demonstrated without a paid OCR service. Any other
 * file goes to NEEDS_REVIEW for manual entry.
 */
public class MockReceiptProcessor implements ReceiptProcessor {

    @Override
    public String name() {
        return "mock";
    }

    @Override
    public ReceiptExtraction process(byte[] content, String contentType, String originalFilename) {
        String name = originalFilename == null ? "" : originalFilename.toLowerCase(Locale.ROOT);
        if (name.contains("uber")) {
            return sample("98.00", "Uber India Systems Pvt Ltd", LocalDate.of(2026, 10, 20), "1240.00", "1180.95",
                    "59.05", "29.52", "29.53", "0.00", "27AAFCU5055K1ZO", "UPI", "TRAVEL",
                    "Uber trip – Bhosari MIDC to Chakan");
        }
        if (name.contains("swiggy")) {
            return sample("96.00", "Swiggy (Bundl Technologies)", LocalDate.of(2026, 10, 7), "1850.00", "1761.90",
                    "88.10", "44.05", "44.05", "0.00", "29AADCB2230M1ZP", "UPI", "FOOD",
                    "Team lunch – Swiggy order");
        }
        if (name.contains("orchid")) {
            return sample("95.00", "The Orchid Hotel Pune", LocalDate.of(2026, 10, 21), "5400.00", "5142.86",
                    "257.14", "128.57", "128.57", "0.00", "27AABCK1234F1Z5", "CARD", "FOOD",
                    "Client dinner with distributor partners");
        }
        if (name.contains("indianoil") || name.contains("fuel")) {
            return sample("97.00", "IndianOil – Hadapsar COCO", LocalDate.of(2026, 10, 22), "3500.00", null,
                    "0.00", "0.00", "0.00", "0.00", null, "CASH", "FUEL", "Diesel for field vehicle");
        }
        return ReceiptExtraction.needsReview(name(),
                "The development OCR provider only recognises the bundled sample receipts. Enter details manually.");
    }

    private ReceiptExtraction sample(String confidence, String vendor, LocalDate date, String total, String taxable,
            String gst, String cgst, String sgst, String igst, String gstin, String payment, String category,
            String description) {
        return new ReceiptExtraction(ProcessingStatus.COMPLETED, name(), new BigDecimal(confidence), vendor, date,
                new BigDecimal(total), taxable == null ? null : new BigDecimal(taxable), new BigDecimal(gst),
                new BigDecimal(cgst), new BigDecimal(sgst), new BigDecimal(igst), gstin, payment, category,
                description, "Extracted by the development mock provider (sample receipt)");
    }
}
