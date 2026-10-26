"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Notice } from "@/components/ui/feedback";
import { Field, Input, Select } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { errorMessage } from "@/lib/api-client";
import { qk } from "@/lib/query-keys";
import { teamService } from "@/services/team-service";
import type { InviteResponse, Member, Role, TeamDto } from "@/types/api";

const ROLES: { value: Exclude<Role, "CA_PARTNER">; label: string }[] = [
  { value: "EMPLOYEE", label: "Employee – submits claims" },
  { value: "MANAGER", label: "Manager – approves team claims" },
  { value: "FINANCE", label: "Finance – batches, payments, reports" },
  { value: "ADMIN", label: "Admin – full control" },
];

export const inviteSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  fullName: z.string().trim().max(120).optional(),
  role: z.enum(["EMPLOYEE", "MANAGER", "FINANCE", "ADMIN"]),
  teamId: z.string().optional(),
  managerMembershipId: z.string().optional(),
});
type InviteValues = z.infer<typeof inviteSchema>;

export function InviteDialog({ open, onOpenChange, companyId, teams, members }: { open: boolean; onOpenChange: (v: boolean) => void; companyId: string; teams: TeamDto[]; members: Member[] }) {
  const qc = useQueryClient();
  const [result, setResult] = useState<InviteResponse | null>(null);
  const form = useForm<InviteValues>({ resolver: zodResolver(inviteSchema), defaultValues: { role: "EMPLOYEE" } });
  const managers = members.filter((m) => m.status === "ACTIVE" && (m.role === "MANAGER" || m.role === "ADMIN"));
  const invite = useMutation({
    mutationFn: (v: InviteValues) => teamService.invite(companyId, { ...v, teamId: v.teamId || undefined, managerMembershipId: v.managerMembershipId || undefined, fullName: v.fullName || undefined }),
    onSuccess: async (r) => {
      setResult(r);
      form.reset({ role: "EMPLOYEE" });
      await qc.invalidateQueries({ queryKey: qk.members(companyId) });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setResult(null);
      }}
    >
      <DialogContent title="Invite a team member" description="They set their own password from the invitation link (valid for 7 days).">
        {result ? (
          <div className="space-y-4">
            <Notice tone="success">Invitation created for {result.invitation.email}.</Notice>
            {result.emailDelivered ? (
              <p className="font-body-md text-body-md text-on-surface-variant">The invitation email has been sent.</p>
            ) : (
              <div className="space-y-2">
                <Notice tone="warning">Email delivery is not configured on this server, so no email was sent. Share this one-time link with the person securely:</Notice>
                <div className="flex gap-2">
                  <Input readOnly value={result.acceptUrl ?? ""} aria-label="Invitation link" onFocus={(e) => e.target.select()} />
                  <Button
                    variant="secondary"
                    onClick={() => {
                      void navigator.clipboard?.writeText(result.acceptUrl ?? "");
                      toast.success("Link copied");
                    }}
                  >
                    <Icon name="content_copy" className="text-[18px]" /> Copy
                  </Button>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setResult(null)}>
                Invite another
              </Button>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit((v) => invite.mutate(v))} className="space-y-4" noValidate>
            <Field label="Work email" htmlFor="inv-email" required error={form.formState.errors.email?.message}>
              <Input id="inv-email" type="email" {...form.register("email")} />
            </Field>
            <Field label="Full name" htmlFor="inv-name">
              <Input id="inv-name" {...form.register("fullName")} />
            </Field>
            <Field label="Role" htmlFor="inv-role" required>
              <Select id="inv-role" {...form.register("role")}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Team" htmlFor="inv-team">
                <Select id="inv-team" {...form.register("teamId")}>
                  <option value="">No team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Reporting manager (approver)" htmlFor="inv-mgr">
                <Select id="inv-mgr" {...form.register("managerMembershipId")}>
                  <option value="">None (admins approve)</option>
                  {managers.map((m) => (
                    <option key={m.membershipId} value={m.membershipId}>
                      {m.fullName}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={invite.isPending}>
                Send invitation
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function EditMemberDialog({ member, onClose, companyId, teams, members }: { member: Member | null; onClose: () => void; companyId: string; teams: TeamDto[]; members: Member[] }) {
  const qc = useQueryClient();
  const [role, setRole] = useState<Role>("EMPLOYEE");
  const [teamId, setTeamId] = useState("");
  const [managerId, setManagerId] = useState("");
  const [designation, setDesignation] = useState("");
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  if (member && loadedFor !== member.membershipId) {
    setLoadedFor(member.membershipId);
    setRole(member.role);
    setTeamId(member.teamId ?? "");
    setManagerId(member.managerMembershipId ?? "");
    setDesignation(member.designation ?? "");
  }
  const save = useMutation({
    mutationFn: (status?: "ACTIVE" | "INACTIVE") =>
      teamService.update(companyId, member!.membershipId, {
        role,
        ...(teamId ? { teamId } : { clearTeam: true }),
        ...(managerId ? { managerMembershipId: managerId } : { clearManager: true }),
        designation,
        status,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["members", companyId] });
      await qc.invalidateQueries({ queryKey: ["audit", companyId] });
      toast.success("Member updated");
      onClose();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  if (!member) return null;
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent title={member.fullName} description={member.email}>
        <div className="space-y-4">
          <Field label="Role" htmlFor="m-role">
            <Select id="m-role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Team" htmlFor="m-team">
              <Select id="m-team" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
                <option value="">No team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Reporting manager" htmlFor="m-mgr">
              <Select id="m-mgr" value={managerId} onChange={(e) => setManagerId(e.target.value)}>
                <option value="">None</option>
                {members
                  .filter((m) => m.membershipId !== member.membershipId && m.status === "ACTIVE" && (m.role === "MANAGER" || m.role === "ADMIN"))
                  .map((m) => (
                    <option key={m.membershipId} value={m.membershipId}>
                      {m.fullName}
                    </option>
                  ))}
              </Select>
            </Field>
          </div>
          <Field label="Designation" htmlFor="m-des">
            <Input id="m-des" value={designation} onChange={(e) => setDesignation(e.target.value)} maxLength={80} />
          </Field>
          <div className="flex flex-wrap justify-between gap-2 pt-2">
            {member.status === "ACTIVE" ? (
              <Button variant="danger-ghost" loading={save.isPending} onClick={() => save.mutate("INACTIVE")}>
                <Icon name="person_off" className="text-[18px]" /> Deactivate
              </Button>
            ) : (
              <Button variant="ghost" loading={save.isPending} onClick={() => save.mutate("ACTIVE")}>
                <Icon name="person_add" className="text-[18px]" /> Reactivate
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button loading={save.isPending} onClick={() => save.mutate(undefined)}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
