import { format as fmt, parseISO } from "date-fns";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2, minimumFractionDigits: 0 });
const inrExact = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const IST = "Asia/Kolkata";

type Money = number | string | null | undefined;

function toNumber(v: Money): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

/** ₹1,24,000 (Indian digit grouping; paise shown only when present). */
export function formatINR(v: Money): string {
  const n = toNumber(v);
  return n === null ? "—" : inr.format(n);
}

/** ₹1,24,000.00 – always two decimals (tables, receipts). */
export function formatINRExact(v: Money): string {
  const n = toNumber(v);
  return n === null ? "—" : inrExact.format(n);
}

/** ₹1.24L / ₹2.5Cr compact form for chart labels. */
export function formatINRCompact(v: Money): string {
  const n = toNumber(v);
  if (n === null) return "—";
  if (Math.abs(n) >= 1e7) return `₹${trim(n / 1e7)}Cr`;
  if (Math.abs(n) >= 1e5) return `₹${trim(n / 1e5)}L`;
  if (Math.abs(n) >= 1e3) return `₹${trim(n / 1e3)}k`;
  return `₹${trim(n)}`;
}

function trim(n: number): string {
  return n.toFixed(2).replace(/\.?0+$/, "");
}

/** Business date "2026-10-08" -> "8 Oct 2026" (no timezone shift). */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return fmt(parseISO(iso.length === 10 ? `${iso}T00:00:00` : iso), "d MMM yyyy");
  } catch {
    return iso;
  }
}

/** UTC instant -> "8 Oct 2026, 09:42" in India Standard Time. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", { timeZone: IST, hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
}

/** Today's date in India as yyyy-MM-dd. */
export function todayInIndia(): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: IST, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return parts;
}

export function currentMonthInIndia(): string {
  return todayInIndia().slice(0, 7);
}

export function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function monthRange(ym: string): { from: string; to: string } {
  const [y, m] = ym.split("-").map(Number);
  const last = new Date(Date.UTC(y ?? 1970, m ?? 1, 0)).getUTCDate();
  return { from: `${ym}-01`, to: `${ym}-${String(last).padStart(2, "0")}` };
}

export function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Indian financial year label for a month, e.g. 2026-10 -> "FY 2026–27 Q3". */
export function fiscalQuarter(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return "";
  const fyStart = m >= 4 ? y : y - 1;
  const q = Math.floor(((m + 8) % 12) / 3) + 1;
  return `FY ${fyStart}–${String((fyStart + 1) % 100).padStart(2, "0")} Q${q}`;
}

export function greeting(date = new Date()): string {
  const hour = Number(new Intl.DateTimeFormat("en-IN", { timeZone: IST, hour: "numeric", hour12: false }).format(date));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
