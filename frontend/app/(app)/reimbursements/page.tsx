"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KpiCard } from "@/components/app/kpi-card";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState, ErrorState, Notice, Skeleton } from "@/components/ui/feedback";
import { Input } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { RequirePermission } from "@/features/auth/app-gate";
import { useWorkspace } from "@/features/auth/auth-provider";
import { ClaimsTable } from "@/features/claims/claims-table";
import { BatchDrawer } from "@/features/reimbursements/batch-drawer";
import { errorMessage } from "@/lib/api-client";
import { formatDateTime, formatINR } from "@/lib/format";
import { invalidateClaimData, qk } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { reimbursementService } from "@/services/reimbursement-service";

export default function ReimbursementsPage() {
  return (
    <RequirePermission permission="VIEW_REIMBURSEMENTS">
      <Reimbursements />
    </RequirePermission>
  );
}

function Reimbursements() {
  const ws = useWorkspace();
  const qc = useQueryClient();
  const canManage = ws.can("MANAGE_REIMBURSEMENTS");
  const batches = useQuery({ queryKey: qk.batches(ws.companyId), queryFn: () => reimbursementService.list(ws.companyId) });
  const eligible = useQuery({ queryKey: qk.eligible(ws.companyId), queryFn: () => reimbursementService.eligible(ws.companyId), enabled: canManage });
  const caps = useQuery({ queryKey: ["batches", ws.companyId, "caps"], queryFn: () => reimbursementService.capabilities(ws.companyId) });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const claims = useMemo(() => eligible.data?.claims ?? [], [eligible.data]);
  // Pre-select every eligible claim whenever the eligible list is (re)loaded.
  const [selectedFor, setSelectedFor] = useState(claims);
  if (selectedFor !== claims) {
    setSelectedFor(claims);
    setSelected(new Set(claims.map((c) => c.id)));
  }
  const selectedTotal = claims.filter((c) => selected.has(c.id)).reduce((s, c) => s + c.totalAmount, 0);
  const list = batches.data ?? [];
  const open$ = list.filter((b) => b.status === "CREATED");
  const paid = list.filter((b) => b.status === "PAID");

  const create = useMutation({
    mutationFn: () => reimbursementService.create(ws.companyId, [...selected], notes || undefined),
    onSuccess: async (d) => {
      await invalidateClaimData(qc, ws.companyId);
      toast.success(`Batch ${d.batch.reference} created with ${d.batch.claimCount} claims (${formatINR(d.batch.totalAmount)})`);
      setNotes("");
      setOpen(d.batch.id);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <>
      <PageHeader title="Reimbursements" description="Group approved claims into batches, download the bank file and record payments." />
      {caps.data && !caps.data.upiPayoutAvailable && (
        <Notice tone="info" icon="account_balance">
          <strong>UPI payouts: not configured.</strong> {caps.data.upiPayoutMessage}
        </Notice>
      )}
      <div className="grid grid-cols-1 gap-space-md md:grid-cols-3">
        <KpiCard label="Approved, not batched" icon="verified" tone="teal" loading={canManage && eligible.isLoading} value={canManage ? formatINR(eligible.data?.totalAmount) : "—"} footer={<span className="text-secondary">{canManage ? `${claims.length} claims ready` : "Finance only"}</span>} />
        <KpiCard label="Open batches" icon="inventory" tone="blue" loading={batches.isLoading} value={formatINR(open$.reduce((s, b) => s + b.totalAmount, 0))} footer={<span>{open$.length} awaiting payment</span>} />
        <KpiCard label="Paid batches" icon="task_alt" loading={batches.isLoading} value={formatINR(paid.reduce((s, b) => s + b.totalAmount, 0))} footer={<span>{paid.length} batches settled</span>} />
      </div>

      {canManage && (
        <Card className="overflow-hidden">
          <div className="p-space-lg pb-space-md">
            <CardHeader
              title="Create a reimbursement batch"
              subtitle="Only approved claims that are not already in a batch can be added."
              icon={
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-container/50 text-on-secondary-container">
                  <Icon name="playlist_add" className="text-[18px]" />
                </span>
              }
            />
          </div>
          {eligible.isError ? (
            <ErrorState error={eligible.error} onRetry={() => void eligible.refetch()} />
          ) : eligible.isLoading ? (
            <div className="p-space-lg">
              <Skeleton className="h-32" />
            </div>
          ) : claims.length === 0 ? (
            <EmptyState icon="inbox" title="Nothing to batch" description="Approved claims appear here once managers approve them." />
          ) : (
            <>
              <ClaimsTable
                claims={claims}
                columns={["select", "id", "employee", "vendor", "date", "category", "amount", "flags"]}
                selected={selected}
                onToggle={(id) =>
                  setSelected((s) => {
                    const n = new Set(s);
                    if (n.has(id)) n.delete(id);
                    else n.add(id);
                    return n;
                  })
                }
                onToggleAll={(v) => setSelected(v ? new Set(claims.map((c) => c.id)) : new Set())}
              />
              <div className="flex flex-col items-stretch justify-between gap-3 border-t border-brand-line p-space-md sm:flex-row sm:items-center">
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Batch note (optional), e.g. October payroll run" className="sm:max-w-sm" maxLength={500} aria-label="Batch note" />
                <div className="flex items-center justify-end gap-3">
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    {selected.size} selected · <strong className="tabular-nums text-on-surface">{formatINR(selectedTotal)}</strong>
                  </span>
                  <Button disabled={selected.size === 0} loading={create.isPending} onClick={() => create.mutate()}>
                    <Icon name="add_task" className="text-[18px]" /> Create batch
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="p-space-lg pb-space-md">
          <CardHeader title="Batches" subtitle="Newest first" />
        </div>
        {batches.isError ? (
          <ErrorState error={batches.error} onRetry={() => void batches.refetch()} />
        ) : batches.isLoading ? (
          <div className="p-space-lg">
            <Skeleton className="h-32" />
          </div>
        ) : list.length === 0 ? (
          <EmptyState icon="payments" title="No batches yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-brand-canvas">
                <tr className="border-b border-brand-line text-left font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Claims</th>
                  <th className="px-4 py-3 text-right">Employees</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Paid</th>
                </tr>
              </thead>
              <tbody>
                {list.map((b) => (
                  <tr key={b.id} onClick={() => setOpen(b.id)} className="h-[52px] cursor-pointer border-b border-brand-line/60 hover:bg-[#F8FAFC]">
                    <td className="px-4 font-label-md text-label-md font-semibold text-on-surface">
                      <button type="button" className="hover:text-brand-link" onClick={() => setOpen(b.id)}>
                        #{b.reference}
                      </button>
                    </td>
                    <td className="px-4">
                      <span className={cn("rounded-full px-2 py-0.5 font-label-sm text-label-sm", b.status === "PAID" ? "bg-success-soft text-success" : "bg-warning-soft text-warning-text")}>
                        {b.status === "PAID" ? "Paid" : "Awaiting payment"}
                      </span>
                    </td>
                    <td className="px-4 text-right tabular-nums">{b.claimCount}</td>
                    <td className="px-4 text-right tabular-nums">{b.employeeCount}</td>
                    <td className="px-4 text-right font-currency-md text-currency-md tabular-nums text-primary">{formatINR(b.totalAmount)}</td>
                    <td className="px-4 font-body-sm text-body-sm text-on-surface-variant">
                      {formatDateTime(b.createdAt)}
                      {b.createdByName ? ` · ${b.createdByName}` : ""}
                    </td>
                    <td className="px-4 font-body-sm text-body-sm text-on-surface-variant">{b.paidAt ? formatDateTime(b.paidAt) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <BatchDrawer companyId={ws.companyId} batchId={open} canManage={canManage} onClose={() => setOpen(null)} />
    </>
  );
}
