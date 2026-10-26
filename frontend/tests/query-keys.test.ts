import { QueryClient } from "@tanstack/react-query";
import { invalidateClaimData, qk } from "@/lib/query-keys";

describe("invalidateClaimData", () => {
  it("invalidates every claim-derived view for that company only", async () => {
    const qc = new QueryClient();
    const keys = [qk.claims("c1", { page: 0 }), qk.claim("c1", "x"), qk.approvals("c1"), qk.dashboard("c1", "2026-10"), qk.navCounts("c1"), qk.batches("c1"), qk.gst("c1"), qk.audit("c1"), qk.messages("c1")];
    keys.forEach((k) => qc.setQueryData(k, 1));
    qc.setQueryData(qk.claims("c2", { page: 0 }), 1);
    qc.setQueryData(qk.categories, 1);
    await invalidateClaimData(qc, "c1");
    keys.forEach((k) => expect(qc.getQueryState(k)?.isInvalidated).toBe(true));
    expect(qc.getQueryState(qk.claims("c2", { page: 0 }))?.isInvalidated).toBe(false);
    expect(qc.getQueryState(qk.categories)?.isInvalidated).toBe(false);
  });
});
