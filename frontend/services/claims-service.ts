import { api, downloadFile } from "@/lib/api-client";
import type {
  ClaimDetail,
  ClaimFilters,
  ClaimListStats,
  ClaimSummary,
  CreateClaimInput,
  ItcStatus,
  PageResponse,
  UpdateClaimInput,
} from "@/types/api";

export function claimQuery(f: ClaimFilters) {
  return {
    q: f.q,
    status: f.status,
    category: f.category,
    employeeId: f.employeeId,
    teamId: f.teamId,
    from: f.from,
    to: f.to,
    flagged: f.flagged ? "true" : undefined,
    source: f.source,
    page: f.page,
    size: f.size,
    sort: f.sort,
  };
}

const base = (companyId: string) => `/companies/${companyId}/claims`;

export const claimsService = {
  list: (companyId: string, filters: ClaimFilters) =>
    api<PageResponse<ClaimSummary>>(base(companyId), { query: claimQuery(filters) }),
  stats: (companyId: string, filters: ClaimFilters) =>
    api<ClaimListStats>(`${base(companyId)}/stats`, {
      query: { q: filters.q, category: filters.category, employeeId: filters.employeeId, from: filters.from, to: filters.to },
    }),
  get: (companyId: string, claimId: string) => api<ClaimDetail>(`${base(companyId)}/${claimId}`),
  create: (companyId: string, input: CreateClaimInput) =>
    api<ClaimDetail>(base(companyId), { method: "POST", body: input }),
  createFromText: (companyId: string, text: string, channel: "WEB" | "WHATSAPP" = "WEB") =>
    api<ClaimDetail>(`${base(companyId)}/text`, { method: "POST", body: { text, channel } }),
  update: (companyId: string, claimId: string, input: UpdateClaimInput) =>
    api<ClaimDetail>(`${base(companyId)}/${claimId}`, { method: "PATCH", body: input }),
  confirm: (companyId: string, claimId: string) =>
    api<ClaimDetail>(`${base(companyId)}/${claimId}/confirm`, { method: "POST" }),
  submit: (companyId: string, claimId: string) =>
    api<ClaimDetail>(`${base(companyId)}/${claimId}/submit`, { method: "POST" }),
  comment: (companyId: string, claimId: string, body: string, kind: "COMMENT" | "CLARIFICATION_REQUEST" | "CLARIFICATION_RESPONSE" = "COMMENT") =>
    api<ClaimDetail>(`${base(companyId)}/${claimId}/comments`, { method: "POST", body: { body, kind } }),
  resolveDuplicate: (companyId: string, claimId: string, duplicate: boolean, note?: string) =>
    api<ClaimDetail>(`${base(companyId)}/${claimId}/duplicate-resolution`, { method: "POST", body: { duplicate, note } }),
  reviewItc: (companyId: string, claimId: string, status: ItcStatus, note?: string) =>
    api<ClaimDetail>(`${base(companyId)}/${claimId}/itc-review`, { method: "POST", body: { status, note } }),
  exportCsv: (companyId: string, filters: ClaimFilters) =>
    downloadFile(`/companies/${companyId}/reports/export`, {
      report: "claims",
      format: "csv",
      from: filters.from,
      to: filters.to,
    }, "claims.csv"),
};
