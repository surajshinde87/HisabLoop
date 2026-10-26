import type { QueryClient } from "@tanstack/react-query";
import type { ClaimFilters, SpendGroup } from "@/types/api";

export const qk = {
  categories: ["categories"] as const,
  navCounts: (c: string) => ["nav", c] as const,
  dashboard: (c: string, month: string) => ["dashboard", c, month] as const,
  claims: (c: string, f?: ClaimFilters) => (f ? (["claims", c, f] as const) : (["claims", c] as const)),
  claimStats: (c: string, f: ClaimFilters) => ["claims", c, "stats", f] as const,
  claim: (c: string, id: string) => ["claim", c, id] as const,
  approvals: (c: string) => ["approvals", c] as const,
  batches: (c: string) => ["batches", c] as const,
  batch: (c: string, id: string) => ["batches", c, id] as const,
  eligible: (c: string) => ["batches", c, "eligible"] as const,
  spend: (c: string, g: SpendGroup, from?: string, to?: string) => ["reports", c, "spend", g, from, to] as const,
  gst: (c: string, from?: string, to?: string) => ["reports", c, "gst", from, to] as const,
  exports: (c: string) => ["reports", c, "exports"] as const,
  policy: (c: string) => ["policy", c] as const,
  members: (c: string) => ["members", c] as const,
  directory: (c: string) => ["members", c, "directory"] as const,
  company: (c: string) => ["company", c] as const,
  caPartners: (c: string) => ["company", c, "ca-partners"] as const,
  audit: (c: string, f?: object) => (f ? (["audit", c, f] as const) : (["audit", c] as const)),
  clients: ["accountant", "clients"] as const,
  clientSummary: (c: string) => ["accountant", "summary", c] as const,
  messages: (c: string) => ["whatsapp", c] as const,
};

/**
 * Everything derived from claim state. Called after any claim, approval or batch mutation so
 * the list, detail, inbox, dashboard, batches, reports and audit views show the backend's state.
 */
export function invalidateClaimData(qc: QueryClient, companyId: string): Promise<void[]> {
  return Promise.all(
    ["claims", "claim", "approvals", "dashboard", "nav", "batches", "reports", "audit", "whatsapp"].map((k) =>
      qc.invalidateQueries({ queryKey: [k, companyId] }),
    ),
  );
}
