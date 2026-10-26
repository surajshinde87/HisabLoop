"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, Notice, Skeleton } from "@/components/ui/feedback";
import { Field, Input, Select } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { RequirePermission } from "@/features/auth/app-gate";
import { useWorkspace } from "@/features/auth/auth-provider";
import { useDirectory } from "@/hooks/use-company-data";
import { formatDateTime } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import { auditService, type AuditFilters } from "@/services/audit-service";

const ACTIONS = [
  "CLAIM_CREATED", "RECEIPT_UPLOADED", "RECEIPT_PROCESSED", "CLAIM_UPDATED", "CLAIM_CONFIRMED", "CLAIM_SUBMITTED",
  "APPROVAL_LEVEL_RECORDED", "CLAIM_APPROVED", "CLAIM_REJECTED", "CHANGES_REQUESTED", "COMMENT_ADDED", "DUPLICATE_RESOLVED",
  "ITC_REVIEWED", "CLAIM_BATCHED", "CLAIM_PAID", "BATCH_CREATED", "BATCH_MARKED_PAID", "BANK_FILE_GENERATED", "EXPORT_GENERATED",
  "POLICY_UPDATED", "MEMBER_INVITED", "MEMBER_JOINED", "MEMBER_ROLE_CHANGED", "MEMBER_STATUS_CHANGED", "MEMBER_UPDATED",
  "TEAM_CREATED", "COMPANY_CREATED", "COMPANY_UPDATED", "CA_ACCESS_GRANTED", "CA_ACCESS_REVOKED",
];
const ENTITIES = ["CLAIM", "BATCH", "POLICY", "MEMBERSHIP", "TEAM", "COMPANY", "CA_RELATIONSHIP"];
const pretty = (s: string) => s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export default function AuditPage() {
  return (
    <RequirePermission permission="VIEW_AUDIT">
      <Audit />
    </RequirePermission>
  );
}

function Audit() {
  const ws = useWorkspace();
  const [filters, setFilters] = useState<AuditFilters>({ page: 0, size: 50 });
  const [expanded, setExpanded] = useState<string | null>(null);
  const directory = useDirectory(ws.companyId, ws.kind === "MEMBER");
  const q = useQuery({ queryKey: qk.audit(ws.companyId, filters), queryFn: () => auditService.list(ws.companyId, filters), placeholderData: keepPreviousData });
  const verify = useMutation({ mutationFn: () => auditService.verify(ws.companyId) });
  const set = (patch: Partial<AuditFilters>) => setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 0 }));
  const data = q.data;

  return (
    <>
      <PageHeader
        title="Audit Log"
        description="Read-only, append-only record of every status change and administrative action."
        actions={
          <Button variant="secondary" loading={verify.isPending} onClick={() => verify.mutate()}>
            <Icon name="verified_user" className="text-[18px] text-secondary" /> Verify integrity
          </Button>
        }
      />
      {verify.data &&
        (verify.data.valid ? (
          <Notice tone="success">Hash chain intact: {verify.data.eventsChecked} events verified; no edits, deletions or re-ordering detected.</Notice>
        ) : (
          <Notice tone="danger">Integrity check failed at event {verify.data.firstInvalidEventId}. The audit table was modified outside the application.</Notice>
        ))}
      <Card className="grid grid-cols-1 gap-3 p-space-md sm:grid-cols-2 xl:grid-cols-5">
        <Field label="From" htmlFor="a-from">
          <Input id="a-from" type="date" value={filters.from ?? ""} onChange={(e) => set({ from: e.target.value || undefined })} />
        </Field>
        <Field label="To" htmlFor="a-to">
          <Input id="a-to" type="date" value={filters.to ?? ""} onChange={(e) => set({ to: e.target.value || undefined })} />
        </Field>
        <Field label="Event" htmlFor="a-action">
          <Select id="a-action" value={filters.action ?? ""} onChange={(e) => set({ action: e.target.value || undefined })}>
            <option value="">All events</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {pretty(a)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Entity / actor" htmlFor="a-entity">
          <div className="flex gap-2">
            <Select id="a-entity" value={filters.entityType ?? ""} onChange={(e) => set({ entityType: e.target.value || undefined })}>
              <option value="">Any entity</option>
              {ENTITIES.map((a) => (
                <option key={a} value={a}>
                  {pretty(a)}
                </option>
              ))}
            </Select>
            {ws.kind === "MEMBER" && (
              <Select aria-label="Actor" value={filters.actorUserId ?? ""} onChange={(e) => set({ actorUserId: e.target.value || undefined })}>
                <option value="">Anyone</option>
                {(directory.data ?? []).map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.fullName}
                  </option>
                ))}
              </Select>
            )}
          </div>
        </Field>
        <Field label="Claim ID" htmlFor="a-claim">
          <Input id="a-claim" placeholder="HL-1042" value={filters.claimRef ?? ""} onChange={(e) => set({ claimRef: e.target.value.trim() || undefined })} />
        </Field>
      </Card>
      <Card className="overflow-hidden">
        {q.isError ? (
          <ErrorState error={q.error} onRetry={() => void q.refetch()} />
        ) : !data ? (
          <div className="p-space-lg">
            <Skeleton className="h-64" />
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState icon="history" title="No events match these filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px]">
              <thead className="bg-brand-canvas">
                <tr className="border-b border-brand-line text-left font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  <th className="px-4 py-3">When (IST)</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Status change</th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.items.map((e) => (
                  <Fragment key={e.id}>
                    <tr className="h-12 border-b border-brand-line/60 font-body-sm text-body-sm">
                      <td className="whitespace-nowrap px-4 text-on-surface-variant">{formatDateTime(e.occurredAt)}</td>
                      <td className="px-4 text-on-surface">{e.actorName}</td>
                      <td className="px-4 font-label-md text-label-md text-primary">{pretty(e.action)}</td>
                      <td className="px-4">
                        {e.entityType === "CLAIM" ? (
                          <Link href={`/claims/${e.entityId}`} className="text-brand-link hover:underline">
                            {e.entityRef ?? e.entityId.slice(0, 8)}
                          </Link>
                        ) : (
                          <span className="text-on-surface-variant">
                            {pretty(e.entityType)} {e.entityRef ? `· ${e.entityRef}` : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-4 text-on-surface-variant">{e.previousStatus || e.newStatus ? `${e.previousStatus ?? "—"} → ${e.newStatus ?? "—"}` : "—"}</td>
                      <td className="px-4">
                        {e.metadataJson && (
                          <button type="button" onClick={() => setExpanded(expanded === e.id ? null : e.id)} className="rounded p-1 text-on-surface-variant hover:bg-surface-container-low" aria-label="Show details" aria-expanded={expanded === e.id}>
                            <Icon name={expanded === e.id ? "expand_less" : "expand_more"} className="text-[18px]" />
                          </button>
                        )}
                      </td>
                    </tr>
                    {expanded === e.id && (
                      <tr className="border-b border-brand-line/60 bg-surface-container-low/50">
                        <td colSpan={6} className="px-4 py-3">
                          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[12px] text-on-surface">{JSON.stringify(JSON.parse(e.metadataJson ?? "{}"), null, 2)}</pre>
                          <p className="mt-2 font-mono text-[11px] text-outline">hash {e.hash}</p>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-brand-line px-space-lg py-3">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Page {data.page + 1} of {data.totalPages} · {data.totalItems} events
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" disabled={data.page === 0} onClick={() => set({ page: data.page - 1 })}>
                Previous
              </Button>
              <Button size="sm" variant="ghost" disabled={data.page >= data.totalPages - 1} onClick={() => set({ page: data.page + 1 })}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
