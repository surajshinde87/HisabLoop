"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EmptyState, ErrorState, Notice, Skeleton } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/features/auth/auth-provider";
import { errorMessage } from "@/lib/api-client";
import { formatDateTime, formatINR, monthLabel } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { accountantService } from "@/services/accountant-service";
import { companyService } from "@/services/company-service";

export default function AccountantPage() {
  const { session, workspace } = useAuth();
  const isCa = Boolean(session?.user.caPartner);
  const isAdmin = workspace?.role === "ADMIN";
  return (
    <>
      <PageHeader
        title="CA Partner Portal"
        description={isCa ? "Your client companies, GST data readiness and exports." : "Give your chartered accountant controlled, read-only access to this company."}
      />
      {isCa && <ClientList />}
      {isAdmin && workspace && <PartnerAccess companyId={workspace.companyId} />}
      {!isCa && !isAdmin && <EmptyState icon="lock" title="Not available for your role" />}
    </>
  );
}

function ClientList() {
  const { selectCompany } = useAuth();
  const router = useRouter();
  const q = useQuery({ queryKey: qk.clients, queryFn: accountantService.clients });
  const [open, setOpen] = useState<string | null>(null);
  const summary = useQuery({ queryKey: qk.clientSummary(open ?? ""), queryFn: () => accountantService.summary(open as string), enabled: Boolean(open) });

  if (q.isError) return <ErrorState error={q.error} onRetry={() => void q.refetch()} />;
  if (!q.data) return <Skeleton className="h-64" />;
  if (q.data.length === 0) return <EmptyState icon="work" title="No client companies yet" description="A company admin grants you access from their HisabLoop workspace." />;

  return (
    <>
      <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
        {q.data.map((c) => (
          <Card key={c.companyId} className={cn("flex flex-col gap-3 p-space-lg", c.accessStatus !== "ACTIVE" && "opacity-60")}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary">{c.companyName}</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  GSTIN {c.gstin ?? "—"} · {[c.city, c.state].filter(Boolean).join(", ")}
                </p>
              </div>
              <span className={cn("rounded-full px-2 py-0.5 font-label-sm text-label-sm", c.accessStatus === "ACTIVE" ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>
                {c.accessStatus === "ACTIVE" ? "Access active" : "Access revoked"}
              </span>
            </div>
            <dl className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-surface-container-low p-2.5">
                <dt className="font-label-sm text-[10px] uppercase text-outline">Pending claims</dt>
                <dd className="font-currency-md text-currency-md text-primary">{c.pendingClaims}</dd>
              </div>
              <div className="rounded-lg bg-surface-container-low p-2.5">
                <dt className="font-label-sm text-[10px] uppercase text-outline">ITC to review</dt>
                <dd className="font-currency-md text-currency-md text-primary">{c.claimsAwaitingItcReview}</dd>
              </div>
              <div className="rounded-lg bg-surface-container-low p-2.5">
                <dt className="font-label-sm text-[10px] uppercase text-outline">GST completeness</dt>
                <dd className={cn("font-currency-md text-currency-md", (c.gstCompletenessPercent ?? 0) < 80 ? "text-error" : "text-secondary")}>{c.gstCompletenessPercent != null ? `${c.gstCompletenessPercent}%` : "—"}</dd>
              </div>
            </dl>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Last export: {c.lastExportAt ? formatDateTime(c.lastExportAt) : "never"}</p>
            {c.accessStatus === "ACTIVE" && (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    selectCompany(c.companyId);
                    router.push("/claims");
                  }}
                >
                  <Icon name="open_in_new" className="text-[18px]" /> Open workspace
                </Button>
                <Button variant="secondary" onClick={() => setOpen(c.companyId)}>
                  <Icon name="insights" className="text-[18px]" /> Summary
                </Button>
                {c.permissions.includes("VIEW_REPORTS") && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      selectCompany(c.companyId);
                      router.push("/reports");
                    }}
                  >
                    GST report
                  </Button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent side="right" title={summary.data?.client.companyName ?? "Client summary"} description="Current Indian financial-year quarter">
          {!summary.data ? (
            <Skeleton className="h-64" />
          ) : (
            <div className="space-y-5">
              <section>
                <h3 className="mb-2 font-headline-sm text-headline-sm text-primary">Claims by status</h3>
                <ul className="grid grid-cols-2 gap-2">
                  {Object.entries(summary.data.claimsByStatus).map(([s, n]) => (
                    <li key={s} className="flex justify-between rounded-lg bg-surface-container-low px-3 py-2 font-body-md text-body-md">
                      <span className="text-on-surface-variant">{s.replace("_", " ").toLowerCase()}</span>
                      <span className="font-semibold text-on-surface">{n}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="mb-2 font-headline-sm text-headline-sm text-primary">GST by month</h3>
                <p className="mb-2 font-body-sm text-body-sm text-on-surface-variant">
                  Total GST {formatINR(summary.data.gstTotal)} · ITC marked eligible {formatINR(summary.data.itcMarkedEligible)}
                </p>
                <ul className="space-y-1.5">
                  {summary.data.gstMonths.map((m) => (
                    <li key={m.month} className="flex justify-between rounded-lg bg-surface-container-low px-3 py-2 font-body-sm text-body-sm">
                      <span>{monthLabel(m.month)}</span>
                      <span className="tabular-nums">
                        {formatINR(m.totalGst)} · {m.completeRows}/{m.rows} complete
                      </span>
                    </li>
                  ))}
                  {summary.data.gstMonths.length === 0 && <li className="font-body-sm text-body-sm text-on-surface-variant">No approved GST invoices this quarter.</li>}
                </ul>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function PartnerAccess({ companyId }: { companyId: string }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: qk.caPartners(companyId), queryFn: () => companyService.caPartners(companyId) });
  const [email, setEmail] = useState("");
  const [audit, setAudit] = useState(false);
  const grant = useMutation({
    mutationFn: () => companyService.grantCa(companyId, { email: email.trim(), canViewAudit: audit }),
    onSuccess: async () => {
      setEmail("");
      await qc.invalidateQueries({ queryKey: qk.caPartners(companyId) });
      toast.success("CA access granted");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const revoke = useMutation({
    mutationFn: (id: string) => companyService.revokeCa(companyId, id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.caPartners(companyId) });
      toast.success("Access revoked immediately");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Card className="space-y-4 p-space-lg">
      <CardHeader title="Accountants with access" subtitle="CA partners can view submitted claims and reports, review ITC and export. They cannot create, approve or pay claims." />
      {q.isLoading ? (
        <Skeleton className="h-24" />
      ) : (q.data ?? []).length === 0 ? (
        <Notice tone="info">No accountant has access yet.</Notice>
      ) : (
        <ul className="space-y-2">
          {q.data?.map((p) => (
            <li key={p.relationshipId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-container-low px-3 py-2.5">
              <div>
                <p className="font-label-lg text-label-lg text-on-surface">
                  {p.name} <span className="font-body-sm text-body-sm text-on-surface-variant">· {p.firmName}</span>
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {p.email} · exports {p.canExport ? "allowed" : "off"} · audit log {p.canViewAudit ? "visible" : "hidden"} · last export {p.lastExportAt ? formatDateTime(p.lastExportAt) : "never"}
                </p>
              </div>
              <Button size="sm" variant="danger-ghost" loading={revoke.isPending} onClick={() => revoke.mutate(p.relationshipId)}>
                Revoke
              </Button>
            </li>
          ))}
        </ul>
      )}
      <form
        className="flex flex-col gap-3 rounded-xl border border-brand-line p-4 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          grant.mutate();
        }}
      >
        <Field label="CA partner's HisabLoop email" htmlFor="ca-email" className="flex-1" hint="The accountant needs a HisabLoop CA partner account.">
          <Input id="ca-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <label className="flex items-center gap-2 pb-2.5 font-body-md text-body-md">
          <input type="checkbox" checked={audit} onChange={(e) => setAudit(e.target.checked)} className="h-4 w-4" /> Allow audit log
        </label>
        <Button type="submit" loading={grant.isPending} disabled={!email.includes("@")}>
          Grant access
        </Button>
      </form>
    </Card>
  );
}
