"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, CategoryChip, StatusBadge } from "@/components/app/badges";
import { PageHeader } from "@/components/app/page-header";
import { ReasonDialog } from "@/components/app/reason-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EmptyState, ErrorState, Notice, Skeleton } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import { RequirePermission } from "@/features/auth/app-gate";
import { useWorkspace } from "@/features/auth/auth-provider";
import { errorMessage } from "@/lib/api-client";
import { formatDate, formatDateTime, formatINR } from "@/lib/format";
import { invalidateClaimData, qk } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { approvalService } from "@/services/approval-service";
import type { BulkResult, PendingApproval } from "@/types/api";

export default function ApprovalsPage() {
  return (
    <RequirePermission permission="APPROVE_CLAIMS">
      <Approvals />
    </RequirePermission>
  );
}

function Approvals() {
  const ws = useWorkspace();
  const qc = useQueryClient();
  const inbox = useQuery({ queryKey: qk.approvals(ws.companyId), queryFn: () => approvalService.inbox(ws.companyId) });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rejecting, setRejecting] = useState<PendingApproval | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);
  const items = useMemo(() => inbox.data ?? [], [inbox.data]);
  const eligible = items.filter((i) => !i.hasBlockingIssues);
  const total = items.reduce((s, i) => s + i.claim.totalAmount, 0);

  const refresh = () => invalidateClaimData(qc, ws.companyId);
  const approveOne = useMutation({
    mutationFn: (id: string) => approvalService.approve(ws.companyId, id),
    onSuccess: async (c) => {
      await refresh();
      toast.success(c.status === "APPROVED" ? `${c.reference} approved` : `${c.reference}: level ${c.approvalsCompleted} approved, awaiting admin`);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const bulk = useMutation({
    mutationFn: (ids: string[]) => approvalService.bulkApprove(ws.companyId, ids),
    onSuccess: async (r) => {
      setBulkResult(r);
      setSelected(new Set());
      await refresh();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <>
      <PageHeader
        title="Approvals"
        badge={items.length > 0 ? <span className="rounded-full bg-error-container px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-error-container">{items.length} pending</span> : undefined}
        description={
          ws.role === "ADMIN"
            ? "Claims waiting for your decision, including second-level approvals above the policy threshold."
            : "Claims from your team waiting for your decision."
        }
        actions={
          <Button variant="accent" disabled={selected.size === 0} loading={bulk.isPending} onClick={() => bulk.mutate([...selected])}>
            <Icon name="done_all" className="text-[18px]" /> Approve selected ({selected.size})
          </Button>
        }
      />
      {items.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-container-lowest px-space-md py-3 shadow-sm">
          <p className="font-body-md text-body-md text-on-surface-variant">
            <strong className="text-on-surface">{formatINR(total)}</strong> across {items.length} claims ·{" "}
            <span className="text-error">{items.length - eligible.length} need individual review</span>
          </p>
          <label className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={eligible.length > 0 && eligible.every((i) => selected.has(i.claim.id))}
              onChange={(e) => setSelected(e.target.checked ? new Set(eligible.map((i) => i.claim.id)) : new Set())}
            />
            Select all without blocking issues ({eligible.length})
          </label>
        </div>
      )}

      {inbox.isError ? (
        <Card>
          <ErrorState error={inbox.error} onRetry={() => void inbox.refetch()} />
        </Card>
      ) : inbox.isLoading ? (
        <div className="grid gap-space-md md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState icon="task_alt" title="You're all caught up" description="No claims are waiting for your approval right now." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-space-md xl:grid-cols-2">
          {items.map((item) => (
            <div key={item.claim.id} className={cn("flex flex-col justify-between space-y-3 rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-shadow hover:shadow-md", selected.has(item.claim.id) && "ring-2 ring-secondary")}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <input
                    type="checkbox"
                    aria-label={`Select ${item.claim.reference}`}
                    disabled={item.hasBlockingIssues}
                    checked={selected.has(item.claim.id)}
                    onChange={() => toggle(item.claim.id)}
                    className="h-4 w-4 shrink-0 disabled:opacity-30"
                    title={item.hasBlockingIssues ? "Has blocking issues – review individually" : undefined}
                  />
                  <Avatar name={item.claim.employee.name} />
                  <div className="overflow-hidden">
                    <h3 className="truncate font-headline-sm text-body-md font-semibold text-on-surface">{item.claim.employee.name}</h3>
                    <p className="truncate font-body-sm text-body-sm text-on-surface-variant">
                      {item.claim.vendorName ?? "—"} · {formatDate(item.claim.receiptDate)}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-currency-md text-currency-md font-bold text-primary">{formatINR(item.claim.totalAmount)}</p>
                  {item.claim.gstAmount > 0 && <p className="font-body-sm text-body-sm text-on-surface-variant">GST {formatINR(item.claim.gstAmount)}</p>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <CategoryChip code={item.claim.categoryCode} />
                <StatusBadge status={item.claim.status} />
                {item.requiredLevels > 1 && (
                  <span className="rounded-full bg-tertiary-fixed px-2 py-0.5 font-label-sm text-label-sm text-on-tertiary-fixed-variant">
                    Level {item.level} of {item.requiredLevels}
                  </span>
                )}
                {!item.claim.hasReceipt && <span className="rounded-full bg-surface-container px-2 py-0.5 font-label-sm text-label-sm text-on-surface-variant">No receipt</span>}
                {item.clarificationRequested && <span className="rounded-full bg-warning-soft px-2 py-0.5 font-label-sm text-label-sm text-warning-text">Awaiting answer</span>}
              </div>
              {item.issues.length > 0 ? (
                <div className="space-y-1.5">
                  {item.issues.map((i) => (
                    <Notice key={i.type} tone={i.blocking ? "danger" : "warning"} className="py-2">
                      {i.message}
                    </Notice>
                  ))}
                </div>
              ) : (
                <Notice tone="success" className="py-2">
                  All policy checks passed
                </Notice>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="font-label-sm text-label-sm text-outline">
                  Ref: {item.claim.reference} · submitted {formatDateTime(item.claim.submittedAt)}
                </span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="danger-ghost" onClick={() => setRejecting(item)}>
                    Reject
                  </Button>
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/claims/${item.claim.id}`}>Review</Link>
                  </Button>
                  {!item.hasBlockingIssues && (
                    <Button size="sm" variant="accent" loading={approveOne.isPending && approveOne.variables === item.claim.id} onClick={() => approveOne.mutate(item.claim.id)}>
                      Approve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ReasonDialog
        open={rejecting !== null}
        onOpenChange={(v) => !v && setRejecting(null)}
        title={`Reject ${rejecting?.claim.reference ?? ""}?`}
        description="Rejection is final. The claimant sees your reason."
        label="Reason for rejection"
        confirmLabel="Reject claim"
        variant="danger"
        onConfirm={async (reason) => {
          if (!rejecting) return;
          await approvalService.reject(ws.companyId, rejecting.claim.id, reason);
          await refresh();
          toast.success(`${rejecting.claim.reference} rejected`);
        }}
      />
      <Dialog open={bulkResult !== null} onOpenChange={(v) => !v && setBulkResult(null)}>
        <DialogContent title="Bulk approval results" description={bulkResult ? `${bulkResult.approved} approved · ${bulkResult.skipped} skipped · ${bulkResult.failed} failed` : undefined}>
          <ul className="space-y-2">
            {bulkResult?.results.map((r) => (
              <li key={r.claimId} className="flex items-start justify-between gap-3 rounded-lg bg-surface-container-low p-3">
                <span className="font-label-md text-label-md text-on-surface">{r.reference ?? r.claimId.slice(0, 8)}</span>
                <span className={cn("text-right font-body-sm text-body-sm", r.outcome === "APPROVED" || r.outcome === "LEVEL_APPROVED" ? "text-success" : r.outcome === "SKIPPED" ? "text-warning-text" : "text-danger")}>{r.message}</span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
