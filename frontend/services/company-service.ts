import { api } from "@/lib/api-client";
import type { CaPartner, Company, NavCounts, PlanInfo } from "@/types/api";

export const companyService = {
  /** Public price list; nothing is charged. */
  plans: () => api<PlanInfo[]>("/public/plans", { noRefresh: true }),
  get: (companyId: string) => api<Company>(`/companies/${companyId}`),
  update: (companyId: string, input: Partial<Omit<Company, "id" | "status" | "createdAt" | "activeMembers" | "subscription">>) =>
    api<Company>(`/companies/${companyId}`, { method: "PATCH", body: input }),
  navCounts: (companyId: string) => api<NavCounts>(`/companies/${companyId}/nav-counts`),
  caPartners: (companyId: string) => api<CaPartner[]>(`/companies/${companyId}/ca-partners`),
  grantCa: (companyId: string, input: { email: string; canViewAudit?: boolean; canExport?: boolean; canReviewItc?: boolean }) =>
    api<CaPartner>(`/companies/${companyId}/ca-partners`, { method: "POST", body: input }),
  revokeCa: (companyId: string, relationshipId: string) =>
    api<void>(`/companies/${companyId}/ca-partners/${relationshipId}`, { method: "DELETE" }),
};
