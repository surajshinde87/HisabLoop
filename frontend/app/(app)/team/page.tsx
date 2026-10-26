"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar } from "@/components/app/badges";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ErrorState, Notice, Skeleton } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { RequirePermission } from "@/features/auth/app-gate";
import { useAuth, useWorkspace } from "@/features/auth/auth-provider";
import { ROLE_LABEL } from "@/features/roles";
import { EditMemberDialog, InviteDialog } from "@/features/team/member-dialogs";
import { errorMessage } from "@/lib/api-client";
import { formatDate, formatINR } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { companyService } from "@/services/company-service";
import { teamService } from "@/services/team-service";
import type { Member } from "@/types/api";

export default function TeamPage() {
  return (
    <RequirePermission permission="VIEW_TEAM">
      <Team />
    </RequirePermission>
  );
}

function Team() {
  const ws = useWorkspace();
  const { reloadSession } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: qk.members(ws.companyId), queryFn: () => teamService.members(ws.companyId) });
  const company = useQuery({ queryKey: qk.company(ws.companyId), queryFn: () => companyService.get(ws.companyId) });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [newTeam, setNewTeam] = useState("");
  const [profile, setProfile] = useState<{ name: string; gstin: string; city: string; state: string } | null>(null);
  const canManage = q.data?.canManage ?? false;

  const createTeam = useMutation({
    mutationFn: () => teamService.createTeam(ws.companyId, newTeam.trim()),
    onSuccess: async () => {
      setNewTeam("");
      await qc.invalidateQueries({ queryKey: qk.members(ws.companyId) });
      toast.success("Team created");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const revoke = useMutation({
    mutationFn: (id: string) => teamService.revokeInvitation(ws.companyId, id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.members(ws.companyId) });
      toast.success("Invitation revoked");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const saveProfile = useMutation({
    mutationFn: () => companyService.update(ws.companyId, profile ?? {}),
    onSuccess: async (c) => {
      qc.setQueryData(qk.company(ws.companyId), c);
      setProfile(null);
      await reloadSession();
      toast.success("Company profile saved");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (q.isError) return <ErrorState error={q.error} onRetry={() => void q.refetch()} className="mt-16" />;
  const data = q.data;
  const c = company.data;

  return (
    <>
      <PageHeader
        title="Team & Settings"
        description="Members, roles, reporting managers and company details."
        actions={
          canManage ? (
            <Button onClick={() => setInviteOpen(true)}>
              <Icon name="person_add" className="text-[18px]" /> Invite member
            </Button>
          ) : undefined
        }
      />
      <Card className="overflow-hidden">
        <div className="p-space-lg pb-space-md">
          <CardHeader title="Members" subtitle={data ? `${data.members.filter((m) => m.status === "ACTIVE").length} active` : undefined} />
        </div>
        {!data ? (
          <div className="p-space-lg">
            <Skeleton className="h-48" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="bg-brand-canvas">
                <tr className="border-b border-brand-line text-left font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Reports to</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                  {canManage && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody>
                {data.members.map((m) => (
                  <tr key={m.membershipId} className={cn("h-[56px] border-b border-brand-line/60", m.status === "INACTIVE" && "opacity-50")}>
                    <td className="px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={m.fullName} size="sm" />
                        <div>
                          <p className="font-label-lg text-label-lg text-on-surface">{m.fullName}</p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            {m.email}
                            {m.designation ? ` · ${m.designation}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 font-body-md text-body-md">{ROLE_LABEL[m.role]}</td>
                    <td className="px-4 font-body-md text-body-md text-on-surface-variant">{m.teamName ?? "—"}</td>
                    <td className="px-4 font-body-md text-body-md text-on-surface-variant">{m.managerName ?? "—"}</td>
                    <td className="px-4">
                      <span className={cn("rounded-full px-2 py-0.5 font-label-sm text-label-sm", m.status === "ACTIVE" ? "bg-success-soft text-success" : "bg-surface-container text-on-surface-variant")}>{m.status === "ACTIVE" ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="px-4 font-body-sm text-body-sm text-on-surface-variant">{formatDate(m.joinedAt)}</td>
                    {canManage && (
                      <td className="px-4 text-right">
                        <Button size="sm" variant="subtle" onClick={() => setEditing(m)}>
                          <Icon name="edit" className="text-[16px]" /> Edit
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-2">
        <Card className="space-y-3 p-space-lg">
          <CardHeader title="Teams" />
          <ul className="flex flex-wrap gap-2">
            {data?.teams.map((t) => (
              <li key={t.id} className="rounded-full bg-surface-container-low px-3 py-1.5 font-label-md text-label-md text-on-surface">
                {t.name} <span className="text-on-surface-variant">· {t.memberCount}</span>
              </li>
            ))}
          </ul>
          {canManage && (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (newTeam.trim()) createTeam.mutate();
              }}
            >
              <Input value={newTeam} onChange={(e) => setNewTeam(e.target.value)} placeholder="New team name" maxLength={80} aria-label="New team name" />
              <Button type="submit" variant="secondary" loading={createTeam.isPending}>
                Add team
              </Button>
            </form>
          )}
          {canManage && data && data.pendingInvitations.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="font-label-md text-label-md uppercase tracking-wider text-outline">Pending invitations</p>
              {data.pendingInvitations.map((i) => (
                <div key={i.id} className="flex items-center justify-between rounded-lg bg-surface-container-low px-3 py-2">
                  <span className="font-body-md text-body-md text-on-surface">
                    {i.email} <span className="text-on-surface-variant">· {ROLE_LABEL[i.role]}</span>
                  </span>
                  <Button size="sm" variant="subtle" loading={revoke.isPending} onClick={() => revoke.mutate(i.id)}>
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-3 p-space-lg">
          <CardHeader
            title="Company profile"
            actions={
              ws.can("MANAGE_COMPANY") && c && !profile ? (
                <Button size="sm" variant="ghost" onClick={() => setProfile({ name: c.name, gstin: c.gstin ?? "", city: c.city ?? "", state: c.state ?? "" })}>
                  <Icon name="edit" className="text-[16px]" /> Edit
                </Button>
              ) : undefined
            }
          />
          {!c ? (
            <Skeleton className="h-32" />
          ) : profile ? (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                saveProfile.mutate();
              }}
            >
              <Field label="Company name" htmlFor="c-name">
                <Input id="c-name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
              </Field>
              <Field label="Company GSTIN" htmlFor="c-gstin" hint="Your own GSTIN (the buyer on B2B invoices).">
                <Input id="c-gstin" className="uppercase" maxLength={15} value={profile.gstin} onChange={(e) => setProfile({ ...profile, gstin: e.target.value.toUpperCase() })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="City" htmlFor="c-city">
                  <Input id="c-city" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
                </Field>
                <Field label="State" htmlFor="c-state">
                  <Input id="c-state" value={profile.state} onChange={(e) => setProfile({ ...profile, state: e.target.value })} />
                </Field>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setProfile(null)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saveProfile.isPending}>
                  Save
                </Button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-2 gap-3 font-body-md text-body-md">
              <div>
                <dt className="font-label-sm text-label-sm uppercase text-outline">Name</dt>
                <dd className="text-on-surface">{c.name}</dd>
              </div>
              <div>
                <dt className="font-label-sm text-label-sm uppercase text-outline">GSTIN</dt>
                <dd className="tabular-nums text-on-surface">{c.gstin ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-label-sm text-label-sm uppercase text-outline">Location</dt>
                <dd className="text-on-surface">{[c.city, c.state].filter(Boolean).join(", ") || "—"}</dd>
              </div>
              <div>
                <dt className="font-label-sm text-label-sm uppercase text-outline">Plan</dt>
                <dd className="text-on-surface">
                  {c.plan.charAt(0) + c.plan.slice(1).toLowerCase()}
                  {c.subscription ? ` · ${formatINR(c.subscription.pricePerUser)}/user/month` : ""}
                </dd>
              </div>
            </dl>
          )}
          {c?.subscription && !c.subscription.billingConfigured && (
            <Notice tone="info" icon="credit_card_off">
              Billing is not connected; no subscription charges are collected. Plans are recorded for planning only.
            </Notice>
          )}
        </Card>
      </div>
      {data && (
        <>
          <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} companyId={ws.companyId} teams={data.teams} members={data.members} />
          <EditMemberDialog member={editing} onClose={() => setEditing(null)} companyId={ws.companyId} teams={data.teams} members={data.members} />
        </>
      )}
    </>
  );
}
