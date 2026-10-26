import { api, downloadFile } from "@/lib/api-client";
import type { Dashboard, ExportJob, GstReport, SpendGroup, SpendReport } from "@/types/api";

export type ExportReport = "claims" | "gst" | "spend";
export type ExportFormat = "csv" | "xlsx";

export const reportService = {
  dashboard: (companyId: string, month?: string) =>
    api<Dashboard>(`/companies/${companyId}/dashboard`, { query: { month } }),
  spend: (companyId: string, groupBy: SpendGroup, from?: string, to?: string) =>
    api<SpendReport>(`/companies/${companyId}/reports/spend`, { query: { groupBy, from, to } }),
  gst: (companyId: string, from?: string, to?: string) =>
    api<GstReport>(`/companies/${companyId}/reports/gst`, { query: { from, to } }),
  exports: (companyId: string) => api<ExportJob[]>(`/companies/${companyId}/reports/exports`),
  download: (companyId: string, report: ExportReport, format: ExportFormat, opts: { from?: string; to?: string; groupBy?: SpendGroup } = {}) =>
    downloadFile(`/companies/${companyId}/reports/export`, { report, format, ...opts }, `hisabloop-${report}.${format}`),
};
