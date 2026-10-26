import { api } from "@/lib/api-client";
import type { BulkResult, ClaimDetail, PendingApproval } from "@/types/api";

export const approvalService = {
  inbox: (companyId: string) => api<PendingApproval[]>(`/companies/${companyId}/approvals`),
  approve: (companyId: string, claimId: string, comment?: string, acknowledgeBlockingIssues = false) =>
    api<ClaimDetail>(`/companies/${companyId}/claims/${claimId}/approve`, {
      method: "POST",
      body: { comment, acknowledgeBlockingIssues },
    }),
  reject: (companyId: string, claimId: string, reason: string) =>
    api<ClaimDetail>(`/companies/${companyId}/claims/${claimId}/reject`, { method: "POST", body: { reason } }),
  requestChanges: (companyId: string, claimId: string, reason: string) =>
    api<ClaimDetail>(`/companies/${companyId}/claims/${claimId}/request-changes`, { method: "POST", body: { reason } }),
  bulkApprove: (companyId: string, claimIds: string[], comment?: string) =>
    api<BulkResult>(`/companies/${companyId}/approvals/bulk`, { method: "POST", body: { claimIds, comment } }),
};
