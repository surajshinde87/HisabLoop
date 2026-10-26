package com.hisabloop.reporting;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hisabloop.accountant.CaClientRelationshipRepository;
import com.hisabloop.audit.AuditService;
import com.hisabloop.claim.ClaimMapper;
import com.hisabloop.claim.ClaimService;
import com.hisabloop.claim.ExpenseClaim;
import com.hisabloop.common.error.ApiException;
import com.hisabloop.common.util.Csv;
import com.hisabloop.company.CompanyAccess;
import com.hisabloop.company.CompanyAccessService;
import com.hisabloop.company.Permission;
import com.hisabloop.user.User;
import com.hisabloop.user.UserRepository;

/** CSV and Excel exports. Every export is permission-checked, recorded and audited. */
@Service
public class ExportService {

    private final CompanyAccessService accessService;
    private final ReportService reports;
    private final ExportJobRepository jobs;
    private final CaClientRelationshipRepository caRelationships;
    private final UserRepository users;
    private final AuditService audit;
    private final Clock clock;

    public ExportService(CompanyAccessService accessService, ReportService reports, ExportJobRepository jobs,
            CaClientRelationshipRepository caRelationships, UserRepository users, AuditService audit, Clock clock) {
        this.accessService = accessService;
        this.reports = reports;
        this.jobs = jobs;
        this.caRelationships = caRelationships;
        this.users = users;
        this.audit = audit;
        this.clock = clock;
    }

    @Transactional
    public ExportFile export(String companyId, String report, String format, LocalDate from, LocalDate to,
            String groupBy) {
        CompanyAccess access = accessService.require(companyId, Permission.EXPORT_DATA);
        String fmt = format == null ? "csv" : format.toLowerCase();
        if (!fmt.equals("csv") && !fmt.equals("xlsx")) {
            throw ApiException.badRequest("invalid_format", "format must be csv or xlsx");
        }
        Table table = switch (report == null ? "" : report) {
            case "claims" -> claimsTable(access, from, to);
            case "gst" -> gstTable(reports.gst(access, from, to));
            case "spend" -> spendTable(reports.spend(access, from, to, groupBy));
            default -> throw ApiException.badRequest("invalid_report", "report must be claims, gst or spend");
        };

        byte[] content = fmt.equals("csv") ? toCsv(table) : toXlsx(table, report);
        ExportJob job = new ExportJob();
        job.setCompanyId(companyId);
        job.setRequestedByUserId(access.userId());
        job.setReportType(report.toUpperCase());
        job.setFormat(fmt.toUpperCase());
        job.setRowCount(table.rows().size());
        job.setStatus("COMPLETED");
        job.setCreatedAt(clock.instant());
        jobs.save(job);
        if (access.caRelationship() != null) {
            caRelationships.findById(access.caRelationship().getId())
                    .ifPresent(rel -> rel.setLastExportAt(clock.instant()));
        }
        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("report", report);
        meta.put("format", fmt);
        meta.put("rows", table.rows().size());
        if (from != null) {
            meta.put("from", from.toString());
        }
        if (to != null) {
            meta.put("to", to.toString());
        }
        audit.record(companyId, "COMPANY", companyId, null, "EXPORT_GENERATED", ClaimService.actor(access), null, null,
                meta);

        String range = (from == null ? "all" : from.toString()) + "_" + (to == null ? "all" : to.toString());
        String filename = "hisabloop-" + report + "-" + range + "." + fmt;
        String contentType = fmt.equals("csv") ? "text/csv; charset=UTF-8"
                : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        return new ExportFile(filename, contentType, content);
    }

    @Transactional(readOnly = true)
    public List<ReportDtos.ExportJobDto> history(String companyId) {
        accessService.require(companyId, Permission.VIEW_REPORTS);
        List<ExportJob> list = jobs.findTop20ByCompanyIdOrderByCreatedAtDesc(companyId);
        Map<String, String> names = users.findAllById(list.stream().map(ExportJob::getRequestedByUserId).toList())
                .stream().collect(Collectors.toMap(User::getId, User::getFullName, (a, b) -> a));
        return list.stream().map(j -> new ReportDtos.ExportJobDto(j.getId(), j.getReportType(), j.getFormat(),
                j.getRowCount(), names.get(j.getRequestedByUserId()), j.getCreatedAt())).toList();
    }

    private Table claimsTable(CompanyAccess access, LocalDate from, LocalDate to) {
        List<String> cols = List.of("Claim ID", "Employee", "Team", "Vendor", "Receipt date", "Category", "Status",
                "Total (INR)", "Taxable value (INR)", "CGST (INR)", "SGST (INR)", "IGST (INR)", "GST total (INR)",
                "Vendor GSTIN", "GSTIN status", "Payment mode", "Flags", "Source", "Has receipt");
        List<List<Object>> rows = new ArrayList<>();
        for (ExpenseClaim c : reports.load(access, from, to)) {
            rows.add(java.util.Arrays.<Object>asList(c.getReference(), c.getEmployee().getUser().getFullName(),
                    DashboardService.teamName(c), c.getVendorName() != null ? c.getVendorName() : c.getDescription(),
                    c.getReceiptDate(), c.getCategoryCode(), c.getStatus().name(), c.getTotalAmount(),
                    c.getTaxableAmount(), c.getCgstAmount(), c.getSgstAmount(), c.getIgstAmount(), c.getGstAmount(),
                    c.getVendorGstin(), c.getGstinStatus().name(), c.getPaymentMode(),
                    String.join(" ", ClaimMapper.flags(c)), c.getSource().name(), c.isHasReceipt() ? "Yes" : "No"));
        }
        return new Table(cols, rows);
    }

    private static Table gstTable(ReportDtos.GstReport r) {
        List<String> cols = List.of("Month", "Claim ID", "Receipt date", "Vendor", "Supplier GSTIN", "GSTIN status",
                "Taxable value (INR)", "CGST (INR)", "SGST (INR)", "IGST (INR)", "Total GST (INR)",
                "Invoice total (INR)", "ITC eligibility (reviewed)", "Data completeness");
        List<List<Object>> rows = new ArrayList<>();
        for (ReportDtos.GstRow g : r.rows()) {
            rows.add(java.util.Arrays.<Object>asList(g.month(), g.claimReference(), g.receiptDate(), g.vendor(), g.gstin(),
                    g.gstinStatus(), g.taxableValue(), g.cgst(), g.sgst(), g.igst(), g.totalGst(), g.invoiceTotal(),
                    g.itcStatus(), g.completenessIssues().isEmpty() ? "Complete" : String.join(" ", g.completenessIssues())));
        }
        return new Table(cols, rows);
    }

    private static Table spendTable(ReportDtos.SpendReport r) {
        List<String> cols = List.of(capitalise(r.groupBy()), "Claims", "Total (INR)", "GST (INR)");
        List<List<Object>> rows = new ArrayList<>();
        for (ReportDtos.SpendRow s : r.rows()) {
            rows.add(java.util.Arrays.<Object>asList(s.label(), s.claimCount(), s.totalAmount(), s.gstAmount()));
        }
        return new Table(cols, rows);
    }

    static byte[] toCsv(Table t) {
        StringBuilder sb = new StringBuilder("﻿");
        sb.append(Csv.row(t.columns()));
        for (List<Object> r : t.rows()) {
            sb.append(Csv.row(r));
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    static byte[] toXlsx(Table t, String sheetName) {
        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet(sheetName);
            CreationHelper helper = wb.getCreationHelper();
            Font bold = wb.createFont();
            bold.setBold(true);
            CellStyle header = wb.createCellStyle();
            header.setFont(bold);
            CellStyle money = wb.createCellStyle();
            money.setDataFormat(helper.createDataFormat().getFormat("#,##0.00"));
            CellStyle date = wb.createCellStyle();
            date.setDataFormat(helper.createDataFormat().getFormat("dd-mmm-yyyy"));

            Row h = sheet.createRow(0);
            for (int i = 0; i < t.columns().size(); i++) {
                Cell cell = h.createCell(i);
                cell.setCellValue(t.columns().get(i));
                cell.setCellStyle(header);
            }
            int r = 1;
            for (List<Object> values : t.rows()) {
                Row row = sheet.createRow(r++);
                for (int i = 0; i < values.size(); i++) {
                    Object v = values.get(i);
                    Cell cell = row.createCell(i);
                    if (v == null) {
                        cell.setBlank();
                    } else if (v instanceof BigDecimal bd) {
                        cell.setCellValue(bd.doubleValue());
                        cell.setCellStyle(money);
                    } else if (v instanceof Number n) {
                        cell.setCellValue(n.doubleValue());
                    } else if (v instanceof LocalDate d) {
                        cell.setCellValue(d);
                        cell.setCellStyle(date);
                    } else {
                        cell.setCellValue(v.toString());
                    }
                }
            }
            sheet.createFreezePane(0, 1);
            for (int i = 0; i < t.columns().size(); i++) {
                sheet.setColumnWidth(i, Math.min(60, Math.max(12, t.columns().get(i).length() + 4)) * 256);
            }
            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private static String capitalise(String s) {
        return s == null || s.isEmpty() ? s : Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    public record Table(List<String> columns, List<List<Object>> rows) {
    }

    public record ExportFile(String filename, String contentType, byte[] content) {
    }
}
