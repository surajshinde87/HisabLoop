import { filtersToParams, parseClaimFilters } from "@/features/claims/use-claim-filters";

describe("claim filters in the URL", () => {
  it("round-trips filters", () => {
    const f = parseClaimFilters(new URLSearchParams("q=uber&status=PAID&status=APPROVED&category=TRAVEL&flagged=true&page=2&from=2026-10-01&to=2026-10-31"));
    expect(f.status).toEqual(["PAID", "APPROVED"]);
    expect(f.flagged).toBe(true);
    expect(f.page).toBe(2);
    const again = parseClaimFilters(filtersToParams(f));
    expect(again).toEqual(f);
  });
  it("drops unknown statuses and bad page numbers", () => {
    const f = parseClaimFilters(new URLSearchParams("status=HACKED&page=-4"));
    expect(f.status).toBeUndefined();
    expect(f.page).toBe(0);
  });
  it("omits defaults from the query string", () => {
    expect(filtersToParams({ page: 0, flagged: false }).toString()).toBe("");
  });
});
