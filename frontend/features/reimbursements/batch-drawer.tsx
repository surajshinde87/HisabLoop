"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StatusBadge } from "@/components/app/badges";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ErrorState, Notice, Skeleton } from "@/components/ui/feedback";
import { Field, Input, Select } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { errorMessage } from "@/lib/api-client";
import { formatDate, formatDateTime, formatINR, todayInIndia } from "@/lib/format";
import { invalidateClaimData, qk } from "@/lib/query-keys";
import { reimbursementService } from "@/services/reimbursement-service";
import type { PaymentMethod } from "@/types/api";

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "NEFT", label: "NEFT" },
  { value: "IMPS", label: "IMPS" },
  { value: "RTGS", label: "RTGS" },
  { value: "UPI_MANUAL", label: "UPI (paid manually)" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "CASH", label: "Cash" },
];

export function BatchDrawer({ companyId, batchId, canManage, onClose }: { companyId: string; batchId: string | null; canManage: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: qk.batch(companyId, batchId ?? ""), queryFn: () => reimbursementService.get(companyId, batchId as string), enabled: Boolean(batchId) });
  const [method, setMethod] = useState<PaymentMethod>("NEFT");
  const [reference, setReference] = useState("");
  const [paidOn, setPaidOn] = useState(todayInIndia());
  const [error, setError] = useState<string | null>(null);
  const markPaid = useMutation({
    mutationFn: () => reimbursementService.markPaid(companyId, batchId as string, { method, reference: reference.trim(), paidOn }),
    onSuccess: async (d) => {
      qc.setQueryData(qk.batch(companyId, d.batch.id), d);
      await invalidateClaimData(qc, companyId);
      toast.success(`${d.batch.reference} marked as paid – ${d.batch.claimCount} claims updated`);
      setReference("");
    },
    onError: (e) => setError(errorMessage(e)),
  });
  const d = q.data;

  async function download() {
    try {
      await reimbursementService.downloadBankFile(companyId, batchId as string);
      toast.success("Bank file downloaded");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <Dialog open={batchId !== null} onOpenChange={(v) => !v && onClose()}>
      <DialogContent side="right" title={d ? `Batch ${d.batch.reference}` : "Batch"} description={d ? `${d.batch.claimCount} claims · ${d.batch.employeeCount} employees` : undefined}>
        {q.isError ? (
          <ErrorState error={q.error} onRetry={() => void q.refetch()} />
        ) : !d ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-40" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-xl bg-surface-container p-4">
              <div>
                <p className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Batch total</p>
                <p className="font-currency-display text-currency-display text-primary">{formatINR(d.batch.totalAmount)}</p>
              </div>
              <span className={d.batch.status === "PAID" ? "rounded-full bg-success-soft px-3 py-1 font-label-md text-label-md text-success" : "rounded-full bg-warning-soft px-3 py-1 font-label-md text-label-md text-warning-text"}>
                {d.batch.status === "PAID" ? "Paid" : "Awaiting payment"}
              </span>
            </div>
            <section className="space-y-2">
              <h3 className="font-headline-sm text-headline-sm text-primary">Employee-wise amounts</h3>
              <ul className="divide-y divide-brand-line rounded-xl border border-brand-line">
                {d.employees.map((e) => (
                  <li key={e.membershipId} className="flex items-center justify-between px-4 py-2.5">
                    <span>
                      <span className="font-label-lg text-label-lg text-on-surface">{e.name}</span>
                      <span className="ml-2 font-body-sm text-body-sm text-on-surface-variant">
                        {e.team ?? ""} · {e.claimCount} claim{e.claimCount > 1 ? "s" : ""}
                      </span>
                    </span>
                    <span className="font-currency-md text-currency-md tabular-nums text-primary">{formatINR(e.amount)}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="space-y-2">
              <h3 className="font-headline-sm text-headline-sm text-primary">Claims</h3>
              <ul className="space-y-1.5">
                {d.claims.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2 rounded-lg bg-surface-container-low px-3 py-2">
                    <a href={`/claims/${c.id}`} className="font-label-md text-label-md text-brand-link hover:underline">
                      #{c.reference}
                    </a>
                    <span className="flex-1 truncate font-body-sm text-body-sm text-on-surface-variant">
                      {c.employee.name} · {c.vendorName} · {formatDate(c.receiptDate)}
                    </span>
                    <StatusBadge status={c.status} />
                    <span className="w-20 text-right font-label-md text-label-md tabular-nums text-on-surface">{formatINR(c.totalAmount)}</span>
                  </li>
                ))}
              </ul>
            </section>
            {canManage && (
              <Button variant="secondary" onClick={() => void download()} className="w-full">
                <Icon name="download" className="text-[18px] text-secondary" /> Download bank file (CSV)
              </Button>
            )}
            {d.payment ? (
              <Notice tone="success" icon="task_alt">
                Paid on {formatDate(d.payment.paidOn)} via {d.payment.method.replace("_", " ")} (ref {d.payment.reference}), recorded by {d.payment.recordedByName ?? "finance"} at {formatDateTime(d.payment.recordedAt)}.
              </Notice>
            ) : canManage ? (
              <section className="space-y-3 rounded-xl bg-surface-container-low p-4">
                <h3 className="font-headline-sm text-headline-sm text-primary">Record payment</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Pay the employees from your bank using the bank file, then record the transfer here. HisabLoop does not move money.
                </p>
                {error && <Notice tone="danger">{error}</Notice>}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field label="Method" htmlFor="method">
                    <Select id="method" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                      {METHODS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="UTR / reference" htmlFor="reference" required>
                    <Input id="reference" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. HDFC-NEFT-1234" maxLength={100} />
                  </Field>
                  <Field label="Paid on" htmlFor="paidOn" required>
                    <Input id="paidOn" type="date" max={todayInIndia()} value={paidOn} onChange={(e) => setPaidOn(e.target.value)} />
                  </Field>
                </div>
                <Button
                  variant="accent"
                  className="w-full"
                  disabled={reference.trim().length < 3}
                  loading={markPaid.isPending}
                  onClick={() => {
                    setError(null);
                    markPaid.mutate();
                  }}
                >
                  <Icon name="payments" className="text-[18px]" /> Mark batch as paid
                </Button>
              </section>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
