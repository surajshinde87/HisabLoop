"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, CategoryChip, FlagChips, StatusBadge } from "@/components/app/badges";
import { Icon } from "@/components/ui/icon";
import { formatDate, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ClaimSummary } from "@/types/api";

export type ClaimColumn = "select" | "id" | "employee" | "vendor" | "date" | "category" | "amount" | "gst" | "status" | "flags" | "action";

const TH = "px-4 py-3 text-left font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant whitespace-nowrap";

/** Financial data table (DESIGN.md): uppercase 11px header on #F6F8FB, 52px rows, tabular amounts. */
export function ClaimsTable({
  claims,
  columns = ["id", "employee", "vendor", "date", "category", "amount", "gst", "status", "flags"],
  selected,
  onToggle,
  onToggleAll,
  sort,
  onSort,
  emptyMessage,
}: {
  claims: ClaimSummary[];
  columns?: ClaimColumn[];
  selected?: Set<string>;
  onToggle?: (id: string) => void;
  onToggleAll?: (checked: boolean) => void;
  sort?: string;
  onSort?: (field: string) => void;
  emptyMessage?: string;
}) {
  const router = useRouter();
  const has = (c: ClaimColumn) => columns.includes(c);
  const sortHeader = (label: string, field: string, align: "left" | "right" = "left") => {
    const [f, dir] = (sort ?? "").split(",");
    const active = f === field;
    return (
      <th scope="col" className={cn(TH, align === "right" && "text-right")} aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}>
        {onSort ? (
          <button type="button" onClick={() => onSort(field)} className={cn("inline-flex items-center gap-0.5 uppercase hover:text-on-surface", align === "right" && "flex-row-reverse")}>
            {label}
            <Icon name={active ? (dir === "asc" ? "arrow_upward" : "arrow_downward") : "unfold_more"} className="text-[14px]" />
          </button>
        ) : (
          label
        )}
      </th>
    );
  };
  const allChecked = Boolean(selected && claims.length > 0 && claims.every((c) => selected.has(c.id)));

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[880px] border-collapse">
        <thead className="bg-brand-canvas">
          <tr className="border-b border-brand-line">
            {has("select") && (
              <th scope="col" className="w-10 px-4 py-3">
                <input type="checkbox" aria-label="Select all" checked={allChecked} onChange={(e) => onToggleAll?.(e.target.checked)} className="h-4 w-4 rounded border-outline-variant" />
              </th>
            )}
            {has("id") && sortHeader("Claim ID", "claimNumber")}
            {has("employee") && <th scope="col" className={TH}>Employee</th>}
            {has("vendor") && sortHeader("Vendor & Receipt", "vendorName")}
            {has("date") && sortHeader("Date", "receiptDate")}
            {has("category") && <th scope="col" className={TH}>Category</th>}
            {has("amount") && sortHeader("Amount (INR)", "totalAmount", "right")}
            {has("gst") && sortHeader("GST", "gstAmount", "right")}
            {has("status") && <th scope="col" className={cn(TH, "text-center")}>Status</th>}
            {has("flags") && <th scope="col" className={TH}>Flags</th>}
            {has("action") && <th scope="col" className={cn(TH, "text-right")}>Action</th>}
          </tr>
        </thead>
        <tbody>
          {claims.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center font-body-md text-body-md text-on-surface-variant">
                {emptyMessage ?? "No claims match these filters."}
              </td>
            </tr>
          )}
          {claims.map((c) => {
            const flagged = c.flags.some((f) => f === "DUPLICATE" || f === "POLICY_VIOLATION" || f === "INVALID_GSTIN");
            return (
              <tr
                key={c.id}
                onClick={() => router.push(`/claims/${c.id}`)}
                className={cn("h-[52px] cursor-pointer border-b border-brand-line/60 transition-colors hover:bg-[#F8FAFC]", flagged && "bg-error-container/10")}
              >
                {has("select") && (
                  <td className="px-4" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" aria-label={`Select ${c.reference}`} checked={selected?.has(c.id) ?? false} onChange={() => onToggle?.(c.id)} className="h-4 w-4 rounded border-outline-variant" />
                  </td>
                )}
                {has("id") && (
                  <td className="whitespace-nowrap px-4 py-2 font-label-md text-label-md font-semibold text-on-surface">
                    <Link href={`/claims/${c.id}`} onClick={(e) => e.stopPropagation()} className="hover:text-brand-link">
                      #{c.reference}
                    </Link>
                  </td>
                )}
                {has("employee") && (
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Avatar name={c.employee.name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-body-md text-body-md text-on-surface">{c.employee.name}</p>
                        {c.employee.team && <p className="truncate font-body-sm text-body-sm text-on-surface-variant">{c.employee.team}</p>}
                      </div>
                    </div>
                  </td>
                )}
                {has("vendor") && (
                  <td className="max-w-[260px] px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-body-md text-body-md text-on-surface">{c.vendorName ?? "—"}</p>
                        <p className="truncate font-body-sm text-body-sm text-on-surface-variant">{c.source === "WHATSAPP" ? "via WhatsApp" : c.source === "TEXT" ? "Text claim" : "Web upload"}</p>
                      </div>
                      {c.hasReceipt ? (
                        <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-surface-container-low px-1.5 py-0.5 font-label-sm text-label-sm text-on-surface-variant" title="Receipt attached">
                          <Icon name="attachment" className="text-[13px]" /> bill
                        </span>
                      ) : (
                        <span className="shrink-0 rounded bg-surface-container-low px-1.5 py-0.5 font-label-sm text-label-sm text-outline">No bill</span>
                      )}
                    </div>
                  </td>
                )}
                {has("date") && <td className="whitespace-nowrap px-4 py-2 font-body-md text-body-md text-on-surface-variant">{formatDate(c.receiptDate)}</td>}
                {has("category") && (
                  <td className="px-4 py-2">
                    <CategoryChip code={c.categoryCode} />
                  </td>
                )}
                {has("amount") && (
                  <td className={cn("whitespace-nowrap px-4 py-2 text-right font-currency-md text-currency-md tabular-nums", flagged ? "text-error" : "text-on-surface")}>
                    {formatINR(c.totalAmount)}
                  </td>
                )}
                {has("gst") && (
                  <td className="whitespace-nowrap px-4 py-2 text-right font-body-md text-body-md tabular-nums text-on-surface-variant">{c.gstAmount > 0 ? formatINR(c.gstAmount) : "—"}</td>
                )}
                {has("status") && (
                  <td className="px-4 py-2 text-center">
                    <StatusBadge status={c.status} />
                  </td>
                )}
                {has("flags") && (
                  <td className="px-4 py-2">
                    <FlagChips flags={c.flags} max={2} />
                  </td>
                )}
                {has("action") && (
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    <Link href={`/claims/${c.id}`} onClick={(e) => e.stopPropagation()} className="font-label-md text-label-md text-secondary hover:underline">
                      View Details
                    </Link>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
