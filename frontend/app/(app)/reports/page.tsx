"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { KpiCard } from "@/components/app/kpi-card";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState, ErrorState, Notice, Skeleton } from "@/components/ui/feedback";
import { Field, Input, Select } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { RequirePermission } from "@/features/auth/app-gate";
import { useWorkspace } from "@/features/auth/auth-provider";
import { errorMessage } from "@/lib/api-client";
import { currentMonthInIndia, formatDate, formatDateTime, formatINR, formatINRCompact, monthLabel, monthRange, shiftMonth } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { reportService, type ExportFormat, type ExportReport } from "@/services/report-service";
import type { SpendGroup } from "@/types/api";

type Tab = "spend" | "gst" | "exports";
const GROUPS: { value: SpendGroup; label: string }[] = [
  { value: "category", label: "Category" },
  { value: "team", label: "Team" },
  { value: "employee", label: "Employee" },
  { value: "vendor", label: "Vendor" },
  { value: "month", label: "Month" },
];
const ISSUE_LABEL: Record<string, string> = {
  MISSING_GSTIN: "Missing GSTIN",
  INVALID_GSTIN: "Invalid GSTIN",
  MISSING_TAXABLE_VALUE: "No taxable value",
  NO_RECEIPT: "No receipt",
  ITC_NOT_REVIEWED: "ITC not reviewed",
};

function presets() {
  const now = currentMonthInIndia();
  const [y, m] = now.split("-").map(Number);
  const qStartMonth = Math.floor(((m ?? 1) - 1) / 3) * 3 + 1;
  const fyStart = (m ?? 1) >= 4 ? (y ?? 2026) : (y ?? 2026) - 1;
  return [
    { label: monthLabel(now), ...monthRange(now) },
    { label: monthLabel(shiftMonth(now, -1)), ...monthRange(shiftMonth(now, -1)) },
    { label: "This quarter", from: `${y}-${String(qStartMonth).padStart(2, "0")}-01`, to: monthRange(now).to },
    { label: `FY ${fyStart}–${String((fyStart + 1) % 100).padStart(2, "0")}`, from: `${fyStart}-04-01`, to: `${fyStart + 1}-03-31` },
  ];
}

export default function ReportsPage() {
  return (
    <RequirePermission permission="VIEW_REPORTS">
      <Reports />
    </RequirePermission>
  );
}

function Reports() {
  const ws = useWorkspace();
  const qc = useQueryClient();
  const p = presets();
  const [range, setRange] = useState<{ from: string; to: string }>({ from: p[2]?.from ?? "", to: p[2]?.to ?? "" });
  const [tab, setTab] = useState<Tab>("spend");
  const [group, setGroup] = useState<SpendGroup>("category");
  const spend = useQuery({ queryKey: qk.spend(ws.companyId, group, range.from, range.to), queryFn: () => reportService.spend(ws.companyId, group, range.from, range.to), enabled: tab === "spend" });
  const gst = useQuery({ queryKey: qk.gst(ws.companyId, range.from, range.to), queryFn: () => reportService.gst(ws.companyId, range.from, range.to), enabled: tab === "gst" });
  const history = useQuery({ queryKey: qk.exports(ws.companyId), queryFn: () => reportService.exports(ws.companyId), enabled: tab === "exports" });
  const [busy, setBusy] = useState<string | null>(null);

  async function download(report: ExportReport, format: ExportFormat) {
    setBusy(`${report}-${format}`);
    try {
      const name = await reportService.download(ws.companyId, report, format, { ...range, groupBy: report === "spend" ? group : undefined });
      toast.success(`Downloaded ${name}`);
      await qc.invalidateQueries({ queryKey: qk.exports(ws.companyId) });
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  const exportButtons = (report: ExportReport) =>
    ws.can("EXPORT_DATA") && (
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" loading={busy === `${report}-csv`} onClick={() => void download(report, "csv")}>
          <Icon name="table_view" className="text-[16px]" /> CSV
        </Button>
        <Button size="sm" variant="ghost" loading={busy === `${report}-xlsx`} onClick={() => void download(report, "xlsx")}>
          <Icon name="grid_on" className="text-[16px]" /> Excel
        </Button>
      </div>
    );

  return (
    <>
      <PageHeader title="Reports & Exports" description="Spend analysis and GST-ready registers built from your claim records." />
      <Card className="flex flex-col gap-3 p-space-md md:flex-row md:items-end md:justify-between">
        <div className="flex flex-wrap gap-2">
          {p.map((x) => (
            <button
              key={x.label}
              type="button"
              onClick={() => setRange({ from: x.from, to: x.to })}
              className={cn("rounded-full px-3 py-1.5 font-label-md text-label-md", range.from === x.from && range.to === x.to ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface hover:bg-surface-container")}
            >
              {x.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Field label="From" htmlFor="from">
            <Input id="from" type="date" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} />
          </Field>
          <Field label="To" htmlFor="to">
            <Input id="to" type="date" value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} />
          </Field>
        </div>
      </Card>

      <div className="flex w-fit rounded-lg bg-surface-container-low p-1" role="tablist">
        {(
          [
            ["spend", "Spend analysis", "bar_chart"],
            ["gst", "GST register", "receipt_long"],
            ["exports", "Exports", "download"],
          ] as const
        ).map(([id, label, icon]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn("flex items-center gap-1.5 rounded-md px-4 py-2 font-label-md text-label-md", tab === id ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:text-primary")}
          >
            <Icon name={icon} className="text-[18px]" /> {label}
          </button>
        ))}
      </div>

      {tab === "spend" && (
        <Card className="space-y-space-md p-space-lg">
          <CardHeader
            title={`Spend by ${GROUPS.find((g) => g.value === group)?.label.toLowerCase()}`}
            subtitle={spend.data ? `${formatDate(range.from)} – ${formatDate(range.to)} · ${spend.data.basis}` : undefined}
            actions={
              <>
                <Select value={group} onChange={(e) => setGroup(e.target.value as SpendGroup)} aria-label="Group by" className="w-40">
                  {GROUPS.map((g) => (
                    <option key={g.value} value={g.value}>
                      By {g.label.toLowerCase()}
                    </option>
                  ))}
                </Select>
                {exportButtons("spend")}
              </>
            }
          />
          {spend.isError ? (
            <ErrorState error={spend.error} onRetry={() => void spend.refetch()} />
          ) : spend.isLoading || !spend.data ? (
            <Skeleton className="h-72" />
          ) : spend.data.rows.length === 0 ? (
            <EmptyState icon="bar_chart" title="No spend in this period" />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
                <KpiCard label="Total spend" icon="account_balance_wallet" value={formatINR(spend.data.total)} footer={<span>{spend.data.claimCount} claims</span>} />
                <KpiCard label="GST on these claims" icon="receipt_long" tone="teal" value={formatINR(spend.data.rows.reduce((s, r) => s + r.gstAmount, 0))} />
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spend.data.rows.slice(0, 12)} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid vertical={false} stroke="#E5EAF1" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#44474f" }} interval={0} angle={spend.data.rows.length > 6 ? -20 : 0} textAnchor={spend.data.rows.length > 6 ? "end" : "middle"} height={spend.data.rows.length > 6 ? 60 : 30} />
                    <YAxis tickFormatter={(v) => formatINRCompact(Number(v))} tick={{ fontSize: 11, fill: "#44474f" }} width={60} />
                    <Tooltip formatter={(v) => formatINR(Number(v))} cursor={{ fill: "#f1f3ff" }} />
                    <Bar dataKey="totalAmount" name="Spend" fill="#0b2a5b" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px]">
                  <thead className="bg-brand-canvas">
                    <tr className="border-b border-brand-line text-left font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                      <th className="px-4 py-3">{GROUPS.find((g) => g.value === group)?.label}</th>
                      <th className="px-4 py-3 text-right">Claims</th>
                      <th className="px-4 py-3 text-right">GST</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-right">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spend.data.rows.map((r) => (
                      <tr key={r.key} className="h-12 border-b border-brand-line/60">
                        <td className="px-4 font-body-md text-body-md text-on-surface">{group === "month" ? monthLabel(r.label) : r.label}</td>
                        <td className="px-4 text-right tabular-nums">{r.claimCount}</td>
                        <td className="px-4 text-right tabular-nums text-on-surface-variant">{formatINR(r.gstAmount)}</td>
                        <td className="px-4 text-right font-currency-md text-currency-md tabular-nums text-primary">{formatINR(r.totalAmount)}</td>
                        <td className="px-4 text-right tabular-nums text-on-surface-variant">{spend.data.total ? Math.round((r.totalAmount / spend.data.total) * 100) : 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      )}

      {tab === "gst" && (
        <Card className="space-y-space-md p-space-lg">
          <CardHeader title="GST input register" subtitle={gst.data?.basis} actions={exportButtons("gst")} />
          <Notice tone="info">
            Extracted tax amounts are not automatically treated as eligible input tax credit. “ITC marked eligible” only counts claims an accountant or finance user reviewed. GSTIN checks are format checks, not registration lookups.
          </Notice>
          {gst.isError ? (
            <ErrorState error={gst.error} onRetry={() => void gst.refetch()} />
          ) : gst.isLoading || !gst.data ? (
            <Skeleton className="h-72" />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-space-md sm:grid-cols-3">
                <KpiCard label="GST captured" icon="receipt_long" value={formatINR(gst.data.totalGst)} footer={<span>{gst.data.rows.length} invoices</span>} />
                <KpiCard label="ITC marked eligible" icon="verified" tone="teal" value={formatINR(gst.data.itcMarkedEligible)} />
                <KpiCard label="Data completeness" icon="fact_check" tone={gst.data.completenessPercent < 80 ? "danger" : "muted"} value={`${gst.data.completenessPercent}%`} footer={<span>rows with no open issues</span>} />
              </div>
              {gst.data.rows.length === 0 ? (
                <EmptyState icon="receipt_long" title="No GST invoices in this period" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px]">
                    <thead className="bg-brand-canvas">
                      <tr className="border-b border-brand-line text-left font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                        <th className="px-3 py-3">Month</th>
                        <th className="px-3 py-3">Claim</th>
                        <th className="px-3 py-3">Vendor</th>
                        <th className="px-3 py-3">GSTIN</th>
                        <th className="px-3 py-3 text-right">Taxable</th>
                        <th className="px-3 py-3 text-right">CGST</th>
                        <th className="px-3 py-3 text-right">SGST</th>
                        <th className="px-3 py-3 text-right">IGST</th>
                        <th className="px-3 py-3">ITC</th>
                        <th className="px-3 py-3">Completeness</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gst.data.rows.map((r) => (
                        <tr key={r.claimId} className="h-12 border-b border-brand-line/60 font-body-sm text-body-sm">
                          <td className="px-3 whitespace-nowrap">{monthLabel(r.month)}</td>
                          <td className="px-3">
                            <a href={`/claims/${r.claimId}`} className="font-label-md text-label-md text-brand-link hover:underline">
                              {r.claimReference}
                            </a>
                          </td>
                          <td className="max-w-[200px] truncate px-3">{r.vendor}</td>
                          <td className={cn("px-3 font-label-md text-label-md tabular-nums", r.gstinStatus === "VALID" ? "text-on-surface" : "text-error")}>{r.gstin ?? "—"}</td>
                          <td className="px-3 text-right tabular-nums">{r.taxableValue != null ? formatINR(r.taxableValue) : "—"}</td>
                          <td className="px-3 text-right tabular-nums">{formatINR(r.cgst)}</td>
                          <td className="px-3 text-right tabular-nums">{formatINR(r.sgst)}</td>
                          <td className="px-3 text-right tabular-nums">{formatINR(r.igst)}</td>
                          <td className="px-3">
                            <span className={cn("rounded-full px-2 py-0.5 font-label-sm text-label-sm", r.itcStatus === "ELIGIBLE" ? "bg-success-soft text-success" : r.itcStatus === "INELIGIBLE" ? "bg-danger-soft text-danger" : "bg-surface-container text-on-surface-variant")}>
                              {r.itcStatus === "UNREVIEWED" ? "Not reviewed" : r.itcStatus.replace("_", " ").toLowerCase()}
                            </span>
                          </td>
                          <td className="px-3">
                            {r.completenessIssues.length === 0 ? (
                              <span className="text-success">Complete</span>
                            ) : (
                              <span className="text-warning-text">{r.completenessIssues.map((i) => ISSUE_LABEL[i] ?? i).join(", ")}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {tab === "exports" && (
        <div className="grid grid-cols-1 gap-space-md lg:grid-cols-2">
          <Card className="space-y-3 p-space-lg">
            <CardHeader title="Download" subtitle={`${formatDate(range.from)} – ${formatDate(range.to)}`} />
            {!ws.can("EXPORT_DATA") ? (
              <Notice tone="warning">Your role can view reports but not export them.</Notice>
            ) : (
              (
                [
                  ["claims", "Claims register", "Every claim with employee, vendor, GST split, status and flags"],
                  ["gst", "GST input register", "Supplier GSTINs, CGST/SGST/IGST and ITC review status"],
                  ["spend", "Spend summary", `Totals grouped by ${group}`],
                ] as const
              ).map(([r, title, desc]) => (
                <div key={r} className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low p-3">
                  <div>
                    <p className="font-label-lg text-label-lg text-on-surface">{title}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{desc}</p>
                  </div>
                  {exportButtons(r)}
                </div>
              ))
            )}
          </Card>
          <Card className="space-y-3 p-space-lg">
            <CardHeader title="Export history" subtitle="Every export is recorded in the audit log" />
            {history.isLoading ? (
              <Skeleton className="h-40" />
            ) : (history.data ?? []).length === 0 ? (
              <EmptyState icon="history" title="No exports yet" />
            ) : (
              <ul className="space-y-2">
                {history.data?.map((h) => (
                  <li key={h.id} className="flex items-center justify-between rounded-lg bg-surface-container-low px-3 py-2">
                    <span className="font-label-md text-label-md text-on-surface">
                      {h.reportType} · {h.format}
                      <span className="ml-2 font-body-sm text-body-sm text-on-surface-variant">{h.rowCount} rows</span>
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {h.requestedByName} · {formatDateTime(h.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
