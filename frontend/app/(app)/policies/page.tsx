"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ErrorState, Notice, Skeleton } from "@/components/ui/feedback";
import { CurrencyInput, Field, Input, Select } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { RequirePermission } from "@/features/auth/app-gate";
import { useWorkspace } from "@/features/auth/auth-provider";
import { policySchema, type PolicyFormInput, type PolicyFormValues } from "@/features/policies/policy-schema";
import { useCategories } from "@/hooks/use-company-data";
import { errorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import { policyService } from "@/services/policy-service";
import type { Policy } from "@/types/api";

export default function PoliciesPage() {
  return (
    <RequirePermission permission="VIEW_POLICIES">
      <Policies />
    </RequirePermission>
  );
}

function toForm(p: Policy): PolicyFormInput {
  return {
    twoLevelApprovalAbove: String(p.twoLevelApprovalAbove),
    duplicateDetectionEnabled: p.duplicateDetectionEnabled,
    duplicateWindowDays: p.duplicateWindowDays,
    gstinValidationEnabled: p.gstinValidationEnabled,
    receiptRequiredAbove: p.receiptRequiredAbove != null ? String(p.receiptRequiredAbove) : "",
    categoryLimits: p.categoryLimits.map((l) => ({ ...l, perClaimLimit: String(l.perClaimLimit) })),
  };
}

function Policies() {
  const ws = useWorkspace();
  const qc = useQueryClient();
  const categories = useCategories();
  const q = useQuery({ queryKey: qk.policy(ws.companyId), queryFn: () => policyService.get(ws.companyId) });
  const form = useForm<PolicyFormInput, unknown, PolicyFormValues>({ resolver: zodResolver(policySchema) });
  const { register, handleSubmit, reset, control, formState } = form;
  const limits = useFieldArray({ control, name: "categoryLimits" });
  const editable = q.data?.canEdit ?? false;

  useEffect(() => {
    if (q.data) reset(toForm(q.data));
  }, [q.data, reset]);

  const save = useMutation({
    mutationFn: (v: PolicyFormValues) =>
      policyService.update(ws.companyId, {
        twoLevelApprovalAbove: Number(v.twoLevelApprovalAbove),
        duplicateDetectionEnabled: v.duplicateDetectionEnabled,
        duplicateWindowDays: v.duplicateWindowDays,
        gstinValidationEnabled: v.gstinValidationEnabled,
        receiptRequiredAbove: v.receiptRequiredAbove === "" ? null : Number(v.receiptRequiredAbove),
        categoryLimits: v.categoryLimits.map((l) => ({ ...l, perClaimLimit: Number(l.perClaimLimit) })),
      }),
    onSuccess: async (p) => {
      qc.setQueryData(qk.policy(ws.companyId), p);
      await qc.invalidateQueries({ queryKey: ["audit", ws.companyId] });
      toast.success("Policy saved. New and re-evaluated claims use these rules.");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (q.isError) return <ErrorState error={q.error} onRetry={() => void q.refetch()} className="mt-16" />;
  if (!q.data) return <Skeleton className="mt-space-md h-96" />;
  const e = formState.errors;

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} className="contents" noValidate>
      <PageHeader
        title="Expense Policies"
        description="Limits, approval levels and checks applied to every claim in this company."
        actions={
          editable ? (
            <Button type="submit" loading={save.isPending} disabled={!formState.isDirty}>
              <Icon name="save" className="text-[18px]" /> Save policy
            </Button>
          ) : undefined
        }
      />
      {!editable && <Notice tone="info">You can view this policy. Only company admins can change it.</Notice>}
      {q.data.updatedByName && (
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Last changed by {q.data.updatedByName} on {formatDateTime(q.data.updatedAt)}. Every change is recorded in the audit log.
        </p>
      )}
      <fieldset disabled={!editable} className="contents">
        <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-2">
          <Card className="space-y-4 p-space-lg">
            <CardHeader title="Approval levels" icon={<Icon name="approval_delegation" className="text-secondary" />} />
            <Field label="Second (admin) approval required above" htmlFor="twoLevel" error={e.twoLevelApprovalAbove?.message} hint="Claims at or below this amount need one approval (reporting manager or admin).">
              <CurrencyInput id="twoLevel" {...register("twoLevelApprovalAbove")} />
            </Field>
            <Field label="Receipt required above" htmlFor="receiptAbove" error={e.receiptRequiredAbove?.message} hint="Leave empty to allow text claims of any amount (they are still flagged as having no receipt).">
              <CurrencyInput id="receiptAbove" placeholder="No limit" {...register("receiptRequiredAbove")} />
            </Field>
          </Card>
          <Card className="space-y-4 p-space-lg">
            <CardHeader title="Automatic checks" icon={<Icon name="policy" className="text-secondary" />} />
            <label className="flex items-start gap-3 rounded-lg bg-surface-container-low p-3">
              <input type="checkbox" className="mt-1 h-4 w-4" {...register("duplicateDetectionEnabled")} />
              <span>
                <span className="block font-label-lg text-label-lg text-on-surface">Duplicate detection</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Flags the same receipt file (SHA-256) or the same vendor + amount + date. A matching vendor alone is never a duplicate.</span>
              </span>
            </label>
            <Field label="Receipt fingerprint look-back (days)" htmlFor="window" error={e.duplicateWindowDays?.message}>
              <Input id="window" type="number" min={1} max={730} {...register("duplicateWindowDays")} />
            </Field>
            <label className="flex items-start gap-3 rounded-lg bg-surface-container-low p-3">
              <input type="checkbox" className="mt-1 h-4 w-4" {...register("gstinValidationEnabled")} />
              <span>
                <span className="block font-label-lg text-label-lg text-on-surface">GSTIN format validation</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Distinguishes missing from invalid GSTINs. This is a format check only; it does not confirm registration with the GST portal.</span>
              </span>
            </label>
          </Card>
        </div>
        <Card className="space-y-4 p-space-lg">
          <CardHeader
            title="Category limits (per claim)"
            subtitle="A role-specific limit overrides the “All roles” limit for that category. Claims above the limit are flagged and need explicit approval."
            actions={
              editable ? (
                <Button size="sm" variant="ghost" onClick={() => limits.append({ categoryCode: categories.data?.[0]?.code ?? "TRAVEL", role: "ALL", perClaimLimit: "1000" })}>
                  <Icon name="add" className="text-[16px]" /> Add limit
                </Button>
              ) : undefined
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead className="bg-brand-canvas">
                <tr className="border-b border-brand-line text-left font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Applies to</th>
                  <th className="px-3 py-3">Limit per claim</th>
                  <th className="w-12 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {limits.fields.map((f, i) => (
                  <tr key={f.id} className="border-b border-brand-line/60">
                    <td className="px-3 py-2">
                      <Select aria-label="Category" {...register(`categoryLimits.${i}.categoryCode`)}>
                        {(categories.data ?? []).map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-3 py-2">
                      <Select aria-label="Role" {...register(`categoryLimits.${i}.role`)}>
                        <option value="ALL">All roles</option>
                        <option value="EMPLOYEE">Employees</option>
                        <option value="MANAGER">Managers</option>
                        <option value="FINANCE">Finance</option>
                        <option value="ADMIN">Admins</option>
                      </Select>
                      {e.categoryLimits?.[i]?.role?.message && <p className="mt-1 font-body-sm text-body-sm text-danger">{e.categoryLimits[i]?.role?.message}</p>}
                    </td>
                    <td className="px-3 py-2">
                      <CurrencyInput aria-label="Limit" {...register(`categoryLimits.${i}.perClaimLimit`)} />
                      {e.categoryLimits?.[i]?.perClaimLimit?.message && <p className="mt-1 font-body-sm text-body-sm text-danger">{e.categoryLimits[i]?.perClaimLimit?.message}</p>}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {editable && (
                        <Button size="icon" variant="subtle" onClick={() => limits.remove(i)} aria-label="Remove limit">
                          <Icon name="delete" className="text-[18px]" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {limits.fields.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center font-body-md text-body-md text-on-surface-variant">
                      No category limits configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </fieldset>
    </form>
  );
}
