package com.hisabloop.common;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.hisabloop.common.util.Csv;

class CsvTest {

    @Test
    void quotesCommasQuotesAndNewlines() {
        assertEquals("\"Swiggy, Pune\"", Csv.escape("Swiggy, Pune"));
        assertEquals("\"He said \"\"hi\"\"\"", Csv.escape("He said \"hi\""));
        assertEquals("\"line1\nline2\"", Csv.escape("line1\nline2"));
    }

    @Test
    void neutralisesSpreadsheetFormulas() {
        assertEquals("\"'=HYPERLINK(\"\"x\"\")\"", Csv.escape("=HYPERLINK(\"x\")"));
        assertEquals("'@SUM(A1)", Csv.escape("@SUM(A1)"));
        assertEquals("-120.50", Csv.escape("-120.50"));
    }

    @Test
    void writesRowsWithCrlf() {
        List<Object> values = Arrays.asList("B-104", null, 3, "1240.00");
        assertEquals("B-104,,3,1240.00\r\n", Csv.row(values));
    }
}
