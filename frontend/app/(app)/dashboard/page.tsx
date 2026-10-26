"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar } from "@/components/app/badges";
import { KpiCard, Pill } from "@/components/app/kpi-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState, Skeleton } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import { RequirePermission } from "@/features/auth/app-gate";
import { useAuth, useWorkspace } from "@/features/auth/auth-provider";
import { ClaimsTable } from "@/features/claims/claims-table";
import { NewClaimDialog } from "@/features/claims/new-claim-dialog";
import { CategoryDonut } from "@/features/dashboard/category-donut";
import { MonthPicker } from "@/features/dashboard/month-picker";
import { SpendTrend } from "@/features/dashboard/spend-trend";
import { errorMessage } from "@/lib/api-client";
import { currentMonthInIndia, fiscalQuarter, formatINR, greeting, monthLabel, monthRange } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import { firstName } from "@/lib/utils";
import { reportService } from "@/services/report-service";

const ISSUE_ICON: Record<string, string> = { DUPLICATE: "content_copy", GSTIN: "receipt_long", CATEGORY_LIMIT: "rule", RECEIPT: "receipt" };

export default function DashboardPage() {
  return (
    <RequirePermission permission="VIEW_CLAIMS">
      <Dashboard />
    </RequirePermission>
  );
}

function Dashboard() {
  const ws = useWorkspace();
  const { session } = useAuth();
  const [month, setMonth] = useState(currentMonthInIndia());
  const [newClaim, setNewClaim] = useState(false);
  const q = useQuery({ queryKey: qk.dashboard(ws.companyId, month), queryFn: () => reportService.dashboard(ws.companyId, month) });
  const d = q.data;
  const loading = q.isLoading;
  const scopeNote = ws.role === "EMPLOYEE" ? "your claims" : ws.role === "MANAGER" ? "you and your team" : ws.companyName;

  async function exportReport() {
    const { from, to } = monthRange(month);
    try {
      await reportService.download(ws.companyId, "claims", "xlsx", { from, to });
      toast.success("Export downloaded");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-space-md pt-space-md lg:flex-row lg:items-center">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-primary md:font-headline-lg md:text-headline-lg">
              {greeting()}, {firstName(session?.user.fullName)} 👋
            </h1>
            <span className="inline-flex items-center rounded-full bg-secondary-fixed px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-secondary-fixed">{fiscalQuarter(month)}</span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">Here&apos;s what&apos;s happening with expenses across {scopeNote}.</p>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <MonthPicker value={month} onChange={setMonth} />
          {ws.can("EXPORT_DATA") && (
            <Button variant="secondary" onClick={() => void exportReport()}>
              <Icon name="download" className="text-[18px] text-secondary" /> Export Report
            </Button>
          )}
          {ws.can("CREATE_CLAIM") && (
            <Button onClick={() => setNewClaim(true)} className="shadow-md">
              <Icon name="add_circle" className="text-[18px]" /> New Claim
            </Button>
          )}
        </div>
      </div>

      {q.isError ? (
        <Card>
          <ErrorState error={q.error} onRetry={() => void q.refetch()} />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-space-md md:grid-cols-2 xl:grid-cols-3">
            <KpiCard
              label={`Total spend · ${monthLabel(month)}`}
              icon="account_balance_wallet"
              loading={loading}
              value={formatINR(d?.totalSpend.amount)}
              footer={
                d?.spendChangePercent != null ? (
                  <span className="flex items-center gap-1 text-secondary">
                    <Icon name={d.spendChangePercent >= 0 ? "arrow_upward" : "arrow_downward"} className="text-[16px]" />
                    <span className="font-semibold">
                      {d.spendChangePercent >= 0 ? "+" : ""}
                      {d.spendChangePercent}%
                    </span>
                    <span className="font-normal text-on-surface-variant">vs last month</span>
                  </span>
                ) : (
                  <span className="text-on-surface-variant">No spend last month to compare</span>
                )
              }
              badge={<Pill>{d?.totalSpend.count ?? 0} claims</Pill>}
            />
            <KpiCard
              label="Pending approvals"
              icon="pending_actions"
              tone="blue"
              loading={loading}
              href="/approvals"
              value={`${d?.pendingApproval.count ?? 0} claims`}
              footer={
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-tertiary-fixed-dim" />
                  <span className="font-semibold text-on-surface">{formatINR(d?.pendingApproval.amount)}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">awaiting review</span>
                </span>
              }
            />
            <KpiCard
              label="Approved awaiting payment"
              icon="verified"
              tone="teal"
              loading={loading}
              href="/reimbursements"
              value={formatINR(d?.approvedAwaitingPayment.amount)}
              footer={
                <span>
                  <span className="font-semibold text-secondary">{d?.approvedAwaitingPayment.count ?? 0} claims</span>{" "}
                  <span className="font-label-sm text-label-sm text-on-surface-variant">ready for a bank batch</span>
                </span>
              }
              badge={d && d.inBatch.count > 0 ? <Pill tone="teal">{d.inBatch.count} in batch</Pill> : undefined}
            />
            <KpiCard
              label="Paid this month"
              icon="task_alt"
              tone="teal"
              loading={loading}
              value={formatINR(d?.paidThisMonth.amount)}
              footer={
                <span>
                  <span className="font-semibold text-on-secondary-container">{d?.paidThisMonth.count ?? 0} claims</span>{" "}
                  <span className="font-label-sm text-label-sm text-on-surface-variant">marked paid</span>
                </span>
              }
            />
            <KpiCard
              label="Average approval time"
              icon="bolt"
              tone="muted"
              loading={loading}
              value={d?.averageApprovalHours != null ? `${d.averageApprovalHours} hours` : "—"}
              footer={
                d?.averageApprovalHours != null && d.previousAverageApprovalHours != null ? (
                  <span className="flex items-center gap-1 text-secondary">
                    <Icon name="speed" className="text-[16px]" />
                    <span className="font-semibold">
                      {d.averageApprovalHours <= d.previousAverageApprovalHours ? "Faster" : "Slower"} than last month
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">({d.previousAverageApprovalHours} h)</span>
                  </span>
                ) : (
                  <span className="text-on-surface-variant">Submit → final approval</span>
                )
              }
            />
            <KpiCard
              label="Flagged claims"
              icon="warning"
              tone="danger"
              loading={loading}
              href="/claims?flagged=true"
              value={`${d?.flagged.count ?? 0} claims`}
              footer={<span className="font-label-sm text-label-sm text-on-error-container">Duplicates, GSTIN gaps or policy limits</span>}
              badge={d && d.flagged.count > 0 ? <Pill tone="danger">Action Needed</Pill> : undefined}
            />
          </div>

          <div className="grid grid-cols-1 items-start gap-space-lg xl:grid-cols-12">
            <Card className="flex flex-col space-y-space-md p-space-lg xl:col-span-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-primary">Spend by Category</h2>
                  <p className="font-label-sm text-label-sm font-normal text-on-surface-variant">{monthLabel(month)} expense allocation</p>
                </div>
                <div className="flex items-center rounded-lg bg-surface-container-low p-1 text-primary">
                  <Icon name="pie_chart" className="text-[18px]" />
                </div>
              </div>
              {loading || !d ? <Skeleton className="h-40" /> : <CategoryDonut data={d.byCategory} total={d.totalSpend.amount} />}
            </Card>
            <Card className="p-space-lg xl:col-span-7">
              {loading || !d ? <Skeleton className="h-64" /> : <SpendTrend months={d.monthlyTrend} teams={d.teams} gstCaptured={d.gstCaptured} itcEligible={d.itcMarkedEligible} />}
            </Card>
          </div>

          {d && d.flaggedClaims.length > 0 && (
            <Card className="space-y-space-md p-space-lg">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-error-container/60 text-error">
                    <Icon name="notification_important" className="text-[20px]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-headline-sm text-headline-sm text-primary">Claims Requiring Immediate Review</h2>
                      <span className="rounded-full bg-error-container px-2 py-0.5 font-label-sm text-label-sm font-bold text-on-error-container">{d.flagged.count} flagged</span>
                    </div>
                    <p className="font-label-sm text-label-sm font-normal text-on-surface-variant">
                      Resolve duplicate claims, missing supplier GSTINs, or policy violations before the next batch
                    </p>
                  </div>
                </div>
                <Link href="/claims?flagged=true" className="flex items-center gap-1 font-label-lg text-label-lg text-secondary transition-colors hover:text-on-secondary-container">
                  Review All Flagged <Icon name="arrow_forward" className="text-[16px]" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
                {d.flaggedClaims.map((f) => (
                  <div key={f.claim.id} className="flex flex-col justify-between space-y-3 rounded-xl bg-surface-container-low p-space-md transition-all hover:bg-surface-container">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <Avatar name={f.claim.employee.name} />
                        <div className="overflow-hidden">
                          <h3 className="truncate font-headline-sm text-body-md font-semibold text-on-surface">{f.claim.employee.name}</h3>
                          <p className="truncate font-body-sm text-body-sm text-on-surface-variant">{f.claim.vendorName ?? "—"}</p>
                        </div>
                      </div>
                      <span className="shrink-0 font-currency-md text-currency-md font-bold text-primary">{formatINR(f.claim.totalAmount)}</span>
                    </div>
                    <div className="flex items-start gap-2 rounded-lg bg-error-container/40 p-2.5">
                      <Icon name={ISSUE_ICON[f.issueType] ?? "error_outline"} className="mt-0.5 shrink-0 text-[18px] text-error" />
                      <div className="space-y-0.5 overflow-hidden">
                        <p className="font-label-md text-label-md font-semibold text-on-error-container">{f.issueTitle}</p>
                        <p className="font-body-sm text-[11px] leading-tight text-on-error-container">{f.issueMessage}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-label-sm text-label-sm text-outline">Ref: {f.claim.reference}</span>
                      <Link href={`/claims/${f.claim.id}`} className="rounded-lg bg-primary px-3 py-1.5 font-label-sm text-label-sm font-semibold text-on-primary transition-colors hover:bg-primary-container">
                        Review Claim
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="space-y-space-sm overflow-hidden">
            <div className="flex items-center justify-between px-space-lg pt-space-lg">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary">Recent Claims Stream</h2>
                <p className="font-label-sm text-label-sm font-normal text-on-surface-variant">Latest submissions from WhatsApp and the web</p>
              </div>
            </div>
            {loading || !d ? (
              <div className="space-y-2 p-space-lg">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : (
              <ClaimsTable claims={d.recentClaims} columns={["id", "employee", "vendor", "date", "amount", "status", "action"]} emptyMessage="No claims yet. Create one with “New Claim”." />
            )}
            <div className="flex items-center justify-between px-space-lg pb-space-md">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Showing the {d?.recentClaims.length ?? 0} most recent claims</span>
              <Link href="/claims" className="rounded-lg bg-surface-container-low px-3 py-1.5 font-label-sm text-label-sm font-semibold text-primary hover:bg-surface-container">
                View all claims →
              </Link>
            </div>
          </Card>
        </>
      )}
      <NewClaimDialog open={newClaim} onOpenChange={setNewClaim} />
    </>
  );
}
