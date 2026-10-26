import { api } from "@/lib/api-client";
import type { InviteResponse, Member, MembersResponse, Role, TeamDto } from "@/types/api";

export interface UpdateMemberInput {
  role?: Role;
  teamId?: string;
  clearTeam?: boolean;
  managerMembershipId?: string;
  clearManager?: boolean;
  status?: "ACTIVE" | "INACTIVE";
  designation?: string;
}

export const teamService = {
  members: (companyId: string) => api<MembersResponse>(`/companies/${companyId}/members`),
  directory: (companyId: string) => api<Member[]>(`/companies/${companyId}/directory`),
  invite: (companyId: string, input: { email: string; fullName?: string; role: Role; teamId?: string; managerMembershipId?: string }) =>
    api<InviteResponse>(`/companies/${companyId}/members/invitations`, { method: "POST", body: input }),
  revokeInvitation: (companyId: string, invitationId: string) =>
    api<void>(`/companies/${companyId}/members/invitations/${invitationId}`, { method: "DELETE" }),
  update: (companyId: string, membershipId: string, input: UpdateMemberInput) =>
    api<Member>(`/companies/${companyId}/members/${membershipId}`, { method: "PATCH", body: input }),
  createTeam: (companyId: string, name: string) =>
    api<TeamDto>(`/companies/${companyId}/teams`, { method: "POST", body: { name } }),
};
