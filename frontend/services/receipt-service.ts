import { api, fetchObjectUrl } from "@/lib/api-client";
import type { ClaimDetail, ReceiptDto } from "@/types/api";

export const receiptService = {
  upload: (companyId: string, claimId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api<ReceiptDto>(`/companies/${companyId}/claims/${claimId}/receipts`, { method: "POST", form });
  },
  process: (companyId: string, receiptId: string) =>
    api<ClaimDetail>(`/companies/${companyId}/receipts/${receiptId}/process`, { method: "POST" }),
  get: (companyId: string, receiptId: string) => api<ReceiptDto>(`/companies/${companyId}/receipts/${receiptId}`),
  objectUrl: (companyId: string, receiptId: string) => fetchObjectUrl(`/companies/${companyId}/receipts/${receiptId}/file`),
};
