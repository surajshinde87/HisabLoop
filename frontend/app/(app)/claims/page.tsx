"use client";

import { Suspense, useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { KpiCard } from "@/components/app/kpi-card";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState, Skeleton, Spinner } from "@/components/ui/feedback";
import { Select } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { RequirePermission } from "@/features/auth/app-gate";
import { useWorkspace } from "@/features/auth/auth-provider";
import { ClaimsTable } from "@/features/claims/claims-table";
import { NewClaimDialog } from "@/features/claims/new-claim-dialog";
import { useClaimFilters } from "@/features/claims/use-claim-filters";
import { useCategories, useDirectory } from "@/hooks/use-company-data";
import { errorMessage } from "@/lib/api-client";
import { formatINR, monthLabel, monthRange, shiftMonth, currentMonthInIndia } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { claimsService } from "@/services/claims-service";
import type { ClaimStatus } from "@/types/api";

const STATUS_OPTIONS: { value: string; label: string; statuses?: ClaimStatus[] }[] = [
  { value: "", label: "All Statuses" },
  { value: "DRAFT", label: "Draft", statuses: ["DRAFT"] },
  { value: "CONFIRMED", label: "Confirmed", statuses: ["CONFIRMED"] },
  { value: "PENDING_APPROVAL", label: "Pending Approval", statuses: ["PENDING_APPROVAL"] },
  { value: "APPROVED", label: "Approved", statuses: ["APPROVED"] },
  { value: "IN_BATCH", label: "In Batch", statuses: ["IN_BATCH"] },
  { value: "PAID", label: "Paid", statuses: ["PAID"] },
  { value: "REJECTED", label: "Rejected", statuses: ["REJECTED"] },
];

export default function ClaimsPage() {
  return (
    <RequirePermission permission="VIEW_CLAIMS">
      <Suspense fallback={<Spinner className="mt-24 self-center" />}>
        <Claims />
      </Suspense>
    </RequirePermission>
  );
}

function monthOptions(): string[] {
  const now = currentMonthInIndia();
  return Array.from({ length: 12 }, (_, i) => shiftMonth(now, -i));
}

function Claims() {
  const ws = useWorkspace();
  const { filters, update } = useClaimFilters();
  const [search, setSearch] = useState(filters.q ?? "");
  const [newClaim, setNewClaim] = useState(false);
  const categories = useCategories();
  const directory = useDirectory(ws.companyId, ws.role !== "EMPLOYEE");

  // Keep the search box in sync when the URL changes (back/forward, cleared filters).
  const [syncedQ, setSyncedQ] = useState(filters.q);
  if (syncedQ !== filters.q) {
    setSyncedQ(filters.q);
    setSearch(filters.q ?? "");
  }
  useEffect(() => {
    const t = setTimeout(() => {
      if ((filters.q ?? "") !== search.trim()) update({ q: search.trim() || undefined });
    }, 350);
    return () => clearTimeout(t);
  }, [search, filters.q, update]);

  const list = useQuery({
    queryKey: qk.claims(ws.companyId, filters),
    queryFn: () => claimsService.list(ws.companyId, filters),
    placeholderData: keepPreviousData,
  });
  const stats = useQuery({ queryKey: qk.claimStats(ws.companyId, filters), queryFn: () => claimsService.stats(ws.companyId, filters) });
  const month = filters.from && filters.to && filters.from.slice(0, 7) === filters.to.slice(0, 7) ? filters.from.slice(0, 7) : "";
  const s = stats.data;
  const page = list.data;

  async function exportCsv() {
    try {
      await claimsService.exportCsv(ws.companyId, filters);
      toast.success("Claims CSV downloaded");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const hasFilters = Boolean(filters.q || filters.status || filters.category || filters.employeeId || filters.from || filters.flagged);
  const sortBy = (field: string) => {
    const [f, dir] = (filters.sort ?? "").split(",");
    update({ sort: f === field && dir !== "asc" ? `${field},asc` : `${field},desc` });
  };

  return (
    <>
      <PageHeader
        title="Claims"
        badge={
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary-fixed px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-secondary-fixed">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" /> Audit Ready
          </span>
        }
        description={ws.role === "EMPLOYEE" ? "Track every expense you have submitted." : ws.role === "MANAGER" ? "Your claims and your team's claims." : "Review and track every expense in one place across all departments."}
        actions={
          <>
            {ws.can("EXPORT_DATA") && (
              <Button variant="secondary" onClick={() => void exportCsv()}>
                <Icon name="download" className="text-[18px]" /> Export CSV
              </Button>
            )}
            {ws.can("CREATE_CLAIM") && (
              <Button onClick={() => setNewClaim(true)}>
                <Icon name="add_circle" className="text-[18px]" /> New Claim
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="All claims" icon="receipt_long" loading={stats.isLoading} value={<span className="flex items-baseline justify-between gap-2">{s?.all.count ?? 0}<span className="font-currency-md text-currency-md">{formatINR(s?.all.amount)}</span></span>} footer={<span className="text-secondary">{month ? `${monthLabel(month)} volume` : "All time"}</span>} />
        <KpiCard label="Pending approval" icon="pending_actions" tone="blue" loading={stats.isLoading} value={<span className="flex items-baseline justify-between gap-2">{s?.pendingApproval.count ?? 0}<span className="font-currency-md text-currency-md">{formatINR(s?.pendingApproval.amount)}</span></span>} footer={<span className="text-on-surface">Requires manager sign-off</span>} />
        <KpiCard label="Approved" icon="verified" tone="teal" loading={stats.isLoading} value={<span className="flex items-baseline justify-between gap-2">{s?.approved.count ?? 0}<span className="font-currency-md text-currency-md">{formatINR(s?.approved.amount)}</span></span>} footer={<span className="text-secondary">Queued for payment batch</span>} />
        <KpiCard label="Needs attention" icon="flag" tone="danger" loading={stats.isLoading} value={<span className="flex items-baseline justify-between gap-2">{s?.needsAttention.count ?? 0}<span className="font-currency-md text-currency-md">{formatINR(s?.needsAttention.amount)}</span></span>} footer={<span className="text-error">Duplicate, limit, or GSTIN issue</span>} />
      </div>

      <Card className="space-y-3 p-space-md md:p-space-lg">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search claims"
              placeholder="Search by Claim ID (HL-1042), employee, or vendor"
              className="h-11 w-full rounded-lg bg-surface-container-low pl-9 pr-3 font-body-md text-body-md placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-[3px] focus:ring-brand-link/15 md:h-10"
            />
          </div>
          <Select aria-label="Status" value={filters.status?.length === 1 ? filters.status[0] : ""} onChange={(e) => update({ status: STATUS_OPTIONS.find((o) => o.value === e.target.value)?.statuses })} className="bg-surface-container-low">
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Select aria-label="Category" value={filters.category ?? ""} onChange={(e) => update({ category: e.target.value || undefined })} className="bg-surface-container-low">
            <option value="">All Categories</option>
            {(categories.data ?? []).map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </Select>
          {ws.role !== "EMPLOYEE" ? (
            <Select aria-label="Employee" value={filters.employeeId ?? ""} onChange={(e) => update({ employeeId: e.target.value || undefined })} className="bg-surface-container-low">
              <option value="">All Employees</option>
              {(directory.data ?? []).map((m) => (
                <option key={m.membershipId} value={m.membershipId}>
                  {m.fullName}
                </option>
              ))}
            </Select>
          ) : (
            <div className="hidden xl:block" />
          )}
          <Select
            aria-label="Month"
            value={month}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) update({ from: undefined, to: undefined });
              else update(monthRange(v));
            }}
            className="bg-surface-container-low"
          >
            <option value="">All months</option>
            {monthOptions().map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            aria-pressed={Boolean(filters.flagged)}
            onClick={() => update({ flagged: !filters.flagged })}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-label-md text-label-md transition-colors",
              filters.flagged ? "bg-error-container text-on-error-container" : "bg-surface-container-low text-on-surface hover:bg-surface-container",
            )}
          >
            <Icon name="flag" className="text-[16px] text-error" filled={filters.flagged} />
            Flagged only
            {s && <span className="rounded-full bg-error-container px-1.5 font-label-sm text-label-sm text-on-error-container">{s.needsAttention.count}</span>}
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                update({ q: undefined, status: undefined, category: undefined, employeeId: undefined, from: undefined, to: undefined, flagged: false, sort: undefined });
              }}
              className="flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary"
            >
              <Icon name="restart_alt" className="text-[16px]" /> Clear Filters
            </button>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        {list.isError ? (
          <ErrorState error={list.error} onRetry={() => void list.refetch()} />
        ) : list.isLoading || !page ? (
          <div className="space-y-2 p-space-lg">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : (
          <div className={cn(list.isFetching && "opacity-70 transition-opacity")}>
            <ClaimsTable claims={page.items} sort={filters.sort} onSort={sortBy} />
          </div>
        )}
        {page && page.totalItems > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-brand-line px-space-lg py-space-md sm:flex-row">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Showing <strong className="text-on-surface">{page.page * page.size + 1}–{page.page * page.size + page.items.length}</strong> of{" "}
              <strong className="text-on-surface">{page.totalItems}</strong> claims
            </p>
            <nav className="flex items-center gap-1" aria-label="Pagination">
              <Button variant="subtle" size="icon" disabled={page.page === 0} onClick={() => update({ page: page.page - 1 }, false)} aria-label="Previous page">
                <Icon name="chevron_left" />
              </Button>
              {Array.from({ length: page.totalPages }, (_, i) => i)
                .filter((i) => Math.abs(i - page.page) <= 2 || i === 0 || i === page.totalPages - 1)
                .map((i, idx, arr) => (
                  <span key={i} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== i - 1 && <span className="px-1 text-outline">…</span>}
                    <button
                      type="button"
                      onClick={() => update({ page: i }, false)}
                      aria-current={i === page.page ? "page" : undefined}
                      className={cn("h-9 min-w-9 rounded-lg px-2 font-label-lg text-label-lg", i === page.page ? "bg-primary text-on-primary" : "text-on-surface hover:bg-surface-container-low")}
                    >
                      {i + 1}
                    </button>
                  </span>
                ))}
              <Button variant="subtle" size="icon" disabled={page.page >= page.totalPages - 1} onClick={() => update({ page: page.page + 1 }, false)} aria-label="Next page">
                <Icon name="chevron_right" />
              </Button>
            </nav>
          </div>
        )}
      </Card>
      <NewClaimDialog open={newClaim} onOpenChange={setNewClaim} />
    </>
  );
}
