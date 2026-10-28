"use client";

import { useState } from "react";
import { formatINR, formatINRCompact } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MonthSpend } from "@/types/api";

/** Six-month spend bars with team tabs (current month highlighted). */
export function SpendTrend({ months, teams, gstCaptured, itcEligible }: { months: MonthSpend[]; teams: string[]; gstCaptured: number; itcEligible: number }) {
  const [team, setTeam] = useState<string>("ALL");
  const value = (m: MonthSpend) => (team === "ALL" ? m.total : (m.byTeam[team] ?? 0));
  const max = Math.max(1, ...months.map(value));
  const current = months[months.length - 1];
  const totalFor = (t: string) => (current ? (t === "ALL" ? current.total : (current.byTeam[t] ?? 0)) : 0);

  return (
    <div className="space-y-space-md">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-primary">Monthly Spend Trend</h2>
          <p className="font-label-sm text-label-sm font-normal text-on-surface-variant">Last 6 months of submitted claims</p>
        </div>
        <div className="flex max-w-full items-center gap-1.5 self-start overflow-x-auto rounded-lg bg-surface-container-low p-1 sm:self-auto" role="tablist" aria-label="Team">
          {["ALL", ...teams].map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={team === t}
              onClick={() => setTeam(t)}
              className={cn(
                "whitespace-nowrap rounded-md px-2.5 py-1 font-label-sm text-label-sm font-semibold",
                team === t ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant transition-colors hover:text-on-surface",
              )}
            >
              {t === "ALL" ? "All" : t} ({formatINRCompact(totalFor(t))})
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-end pt-4">
        <div className="flex h-48 w-full items-end justify-between gap-3 px-2 sm:gap-6">
          {months.map((m, i) => {
            const isCurrent = i === months.length - 1;
            const v = value(m);
            const h = Math.max(4, Math.round((v / max) * 154));
            return (
              <div key={m.month} className="group flex flex-1 flex-col items-center gap-2" title={`${m.label}: ${formatINR(v)}`}>
                <span className={cn("font-label-sm text-[11px]", isCurrent ? "font-bold text-secondary" : "text-outline opacity-0 transition-opacity group-hover:opacity-100")}>
                  {formatINRCompact(v)}
                </span>
                <div
                  className={cn("relative w-full max-w-[48px] rounded-t-lg transition-all duration-300", isCurrent ? "bg-primary shadow-sm" : "bg-surface-container hover:bg-surface-container-highest")}
                  style={{ height: `${h}px` }}
                >
                  {isCurrent && <div className="absolute inset-x-0 top-0 h-2 rounded-t-lg bg-secondary" />}
                </div>
                <span className={cn("font-label-sm text-label-sm", isCurrent ? "font-bold text-primary" : "font-medium text-on-surface-variant")}>{m.label}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 font-body-sm text-body-sm text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-primary" />
            <span>Selected month</span>
            <span className="ml-2 h-3 w-3 rounded-sm bg-surface-container" />
            <span>Prior months</span>
          </div>
          <span className="flex items-center gap-1 font-label-sm text-label-sm font-semibold text-secondary" title="GST captured on submitted claims this month; ITC counts only claims your CA marked eligible">
            <span className="material-symbols-outlined text-[14px]" aria-hidden>auto_graph</span>
            GST captured: {formatINR(gstCaptured)} · ITC marked eligible: {formatINR(itcEligible)}
          </span>
        </div>
      </div>
    </div>
  );
}
