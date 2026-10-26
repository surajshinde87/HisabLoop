package com.hisabloop.reporting;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hisabloop.common.error.ApiException;

@RestController
@RequestMapping("/api/v1/companies/{companyId}")
public class ReportController {

    private final DashboardService dashboard;
    private final ReportService reports;
    private final ExportService exports;

    public ReportController(DashboardService dashboard, ReportService reports, ExportService exports) {
        this.dashboard = dashboard;
        this.reports = reports;
        this.exports = exports;
    }

    @GetMapping("/dashboard")
    public ReportDtos.Dashboard dashboard(@PathVariable String companyId,
            @RequestParam(required = false) String month) {
        YearMonth ym = null;
        if (month != null && !month.isBlank()) {
            try {
                ym = YearMonth.parse(month);
            } catch (java.time.format.DateTimeParseException e) {
                throw ApiException.badRequest("invalid_month", "month must look like 2026-10");
            }
        }
        return dashboard.dashboard(companyId, ym);
    }

    @GetMapping("/nav-counts")
    public ReportDtos.NavCounts navCounts(@PathVariable String companyId) {
        return dashboard.navCounts(companyId);
    }

    @GetMapping("/reports/spend")
    public ReportDtos.SpendReport spend(@PathVariable String companyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "category") String groupBy) {
        return reports.spend(companyId, from, to, groupBy);
    }

    @GetMapping("/reports/gst")
    public ReportDtos.GstReport gst(@PathVariable String companyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return reports.gst(companyId, from, to);
    }

    /** report = claims | gst | spend; format = csv | xlsx. */
    @GetMapping("/reports/export")
    public ResponseEntity<byte[]> export(@PathVariable String companyId,
            @RequestParam String report,
            @RequestParam(defaultValue = "csv") String format,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String groupBy) {
        ExportService.ExportFile file = exports.export(companyId, report, format, from, to, groupBy);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(file.filename()).build().toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(file.content());
    }

    @GetMapping("/reports/exports")
    public List<ReportDtos.ExportJobDto> exportHistory(@PathVariable String companyId) {
        return exports.history(companyId);
    }
}
