import { api, downloadFile } from "@/lib/api-client";
import type { BatchDetail, BatchSummary, EligibleClaims, PaymentMethod, PayoutCapabilities } from "@/types/api";

const base = (companyId: string) => `/companies/${companyId}/reimbursement-batches`;

export const reimbursementService = {
  list: (companyId: string) => api<BatchSummary[]>(base(companyId)),
  eligible: (companyId: string) => api<EligibleClaims>(`${base(companyId)}/eligible-claims`),
  capabilities: (companyId: string) => api<PayoutCapabilities>(`${base(companyId)}/capabilities`),
  get: (companyId: string, batchId: string) => api<BatchDetail>(`${base(companyId)}/${batchId}`),
  create: (companyId: string, claimIds: string[], notes?: string) =>
    api<BatchDetail>(base(companyId), { method: "POST", body: { claimIds, notes } }),
  markPaid: (companyId: string, batchId: string, input: { method: PaymentMethod; reference: string; paidOn: string }) =>
    api<BatchDetail>(`${base(companyId)}/${batchId}/mark-paid`, { method: "POST", body: input }),
  downloadBankFile: (companyId: string, batchId: string) =>
    downloadFile(`${base(companyId)}/${batchId}/bank-file`, undefined, "bank-file.csv"),
};
