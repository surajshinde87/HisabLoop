import { formatDate, formatINR, formatINRCompact, formatINRExact, fiscalQuarter, monthRange, shiftMonth } from "@/lib/format";

describe("currency formatting", () => {
  it("uses Indian digit grouping", () => {
    expect(formatINR(124000)).toBe("₹1,24,000");
    expect(formatINR("1240.5")).toBe("₹1,240.5");
    expect(formatINRExact(1240)).toBe("₹1,240.00");
  });
  it("renders missing values as a dash, never ₹0", () => {
    expect(formatINR(null)).toBe("—");
    expect(formatINR(undefined)).toBe("—");
    expect(formatINR("")).toBe("—");
    expect(formatINRExact("abc")).toBe("—");
  });
  it("compacts lakhs and crores", () => {
    expect(formatINRCompact(124000)).toBe("₹1.24L");
    expect(formatINRCompact(25_000_000)).toBe("₹2.5Cr");
    expect(formatINRCompact(5400)).toBe("₹5.4k");
    expect(formatINRCompact(180)).toBe("₹180");
  });
});

describe("dates", () => {
  it("formats business dates without a timezone shift", () => {
    expect(formatDate("2026-10-08")).toBe("8 Oct 2026");
    expect(formatDate(null)).toBe("—");
  });
  it("computes month ranges and shifts across years", () => {
    expect(monthRange("2026-02")).toEqual({ from: "2026-02-01", to: "2026-02-28" });
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
  });
  it("uses the Indian April–March financial year", () => {
    expect(fiscalQuarter("2026-10")).toMatch(/Q3/);
    expect(fiscalQuarter("2026-04")).toMatch(/Q1/);
    expect(fiscalQuarter("2027-02")).toMatch(/Q4/);
  });
});
