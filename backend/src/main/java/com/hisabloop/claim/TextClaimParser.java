package com.hisabloop.claim;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Deterministic parser for receipt-less text claims such as "Auto fare 180 cash" or
 * "Metro rail ticket ₹45 to Dadar office". It only suggests values; the employee confirms them.
 */
public final class TextClaimParser {

    private static final Pattern AMOUNT = Pattern.compile(
            "(?:₹|\\brs\\.?|\\binr)?\\s*(\\d{1,3}(?:,\\d{2,3})+(?:\\.\\d{1,2})?|\\d{1,7}(?:\\.\\d{1,2})?)",
            Pattern.CASE_INSENSITIVE);

    private static final Map<String, String> CATEGORY_KEYWORDS = new LinkedHashMap<>();
    private static final Map<String, String> PAYMENT_KEYWORDS = new LinkedHashMap<>();

    static {
        for (String k : new String[] {"auto", "rickshaw", "taxi", "cab", "uber", "ola", "metro", "rail", "train",
                "bus", "flight", "toll", "parking", "travel"}) {
            CATEGORY_KEYWORDS.put(k, "TRAVEL");
        }
        for (String k : new String[] {"petrol", "diesel", "fuel", "cng"}) {
            CATEGORY_KEYWORDS.put(k, "FUEL");
        }
        for (String k : new String[] {"client dinner", "client lunch", "entertainment"}) {
            CATEGORY_KEYWORDS.put(k, "CLIENT_ENTERTAINMENT");
        }
        for (String k : new String[] {"lunch", "dinner", "breakfast", "tea", "snacks", "meal", "food", "swiggy",
                "zomato"}) {
            CATEGORY_KEYWORDS.put(k, "FOOD");
        }
        for (String k : new String[] {"stationery", "printer", "courier", "office"}) {
            CATEGORY_KEYWORDS.put(k, "OFFICE");
        }
        for (String k : new String[] {"software", "subscription", "saas", "domain", "broadband", "internet"}) {
            CATEGORY_KEYWORDS.put(k, "SOFTWARE");
        }
        PAYMENT_KEYWORDS.put("cash", "CASH");
        PAYMENT_KEYWORDS.put("upi", "UPI");
        PAYMENT_KEYWORDS.put("gpay", "UPI");
        PAYMENT_KEYWORDS.put("phonepe", "UPI");
        PAYMENT_KEYWORDS.put("paytm", "UPI");
        PAYMENT_KEYWORDS.put("card", "CARD");
    }

    private TextClaimParser() {
    }

    public static Parsed parse(String text) {
        if (text == null || text.isBlank()) {
            return new Parsed(null, "OTHER", null, null);
        }
        String lower = " " + text.toLowerCase(Locale.ROOT) + " ";

        // Prefer an amount written with a currency marker (₹45, Rs 45); otherwise take the largest
        // number, which skips dates such as "8 Oct" in "Taxi on 8 Oct 450".
        BigDecimal marked = null;
        BigDecimal largest = null;
        Matcher m = AMOUNT.matcher(text);
        while (m.find()) {
            String raw = m.group(1).replace(",", "");
            BigDecimal candidate;
            try {
                candidate = new BigDecimal(raw);
            } catch (NumberFormatException ignored) {
                continue;
            }
            if (candidate.signum() <= 0) {
                continue;
            }
            boolean hasMarker = !m.group(0).trim().equals(m.group(1));
            if (hasMarker && marked == null) {
                marked = candidate;
            }
            if (largest == null || candidate.compareTo(largest) > 0) {
                largest = candidate;
            }
        }
        BigDecimal amount = marked != null ? marked : largest;
        if (amount != null) {
            amount = amount.setScale(2, RoundingMode.HALF_UP);
        }

        String category = "OTHER";
        for (Map.Entry<String, String> e : CATEGORY_KEYWORDS.entrySet()) {
            if (lower.contains(" " + e.getKey())) {
                category = e.getValue();
                break;
            }
        }

        String payment = null;
        for (Map.Entry<String, String> e : PAYMENT_KEYWORDS.entrySet()) {
            if (lower.contains(" " + e.getKey())) {
                payment = e.getValue();
                break;
            }
        }

        String description = text.trim();
        if (description.length() > 500) {
            description = description.substring(0, 500);
        }
        return new Parsed(amount, category, payment, description);
    }

    public record Parsed(BigDecimal amount, String categoryCode, String paymentMode, String description) {
    }
}
