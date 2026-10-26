package com.hisabloop.common.util;

import java.util.List;

/** Minimal RFC 4180 CSV writer with spreadsheet formula-injection protection. */
public final class Csv {

    private Csv() {
    }

    public static String escape(Object value) {
        if (value == null) {
            return "";
        }
        String s = value.toString();
        // Prevent CSV/formula injection when opened in Excel/Sheets.
        if (!s.isEmpty() && "=+-@\t\r".indexOf(s.charAt(0)) >= 0 && !isNumeric(s)) {
            s = "'" + s;
        }
        boolean needsQuotes = s.contains(",") || s.contains("\"") || s.contains("\n") || s.contains("\r");
        if (needsQuotes) {
            s = "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }

    public static String row(List<?> values) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < values.size(); i++) {
            if (i > 0) {
                sb.append(',');
            }
            sb.append(escape(values.get(i)));
        }
        return sb.append("\r\n").toString();
    }

    private static boolean isNumeric(String s) {
        return s.matches("-?\\d+(\\.\\d+)?");
    }
}
