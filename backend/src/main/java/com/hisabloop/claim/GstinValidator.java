package com.hisabloop.claim;

import java.util.regex.Pattern;

/**
 * GSTIN <b>format</b> check: 2-digit state code, 10-character PAN, entity number, 'Z', check
 * character. Passing this check does not prove the GSTIN is registered, active, or belongs to the
 * vendor; that needs a GST portal lookup.
 */
public final class GstinValidator {

    public static final Pattern GSTIN_PATTERN =
            Pattern.compile("^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$");

    private GstinValidator() {
    }

    public static boolean isValidFormat(String gstin) {
        return gstin != null && GSTIN_PATTERN.matcher(gstin).matches();
    }

    public static String normalise(String gstin) {
        if (gstin == null) {
            return null;
        }
        String trimmed = gstin.replaceAll("\\s+", "").toUpperCase();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
