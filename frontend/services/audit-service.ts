import { api } from "@/lib/api-client";
import type { AuditEvent, ChainVerification, PageResponse } from "@/types/api";

export interface AuditFilters {
  from?: string;
  to?: string;
  actorUserId?: string;
  action?: string;
  entityType?: string;
  claimRef?: string;
  page?: number;
  size?: number;
}

export const auditService = {
  list: (companyId: string, filters: AuditFilters) =>
    api<PageResponse<AuditEvent>>(`/companies/${companyId}/audit-events`, { query: { ...filters } }),
  verify: (companyId: string) => api<ChainVerification>(`/companies/${companyId}/audit-events/verify`),
};
