"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatINR, formatINRCompact } from "@/lib/format";
import type { CategorySpend } from "@/types/api";

/** Palette: navy, teal, blue, mint, light blue, pale. */
export const CATEGORY_COLORS = ["#00163a", "#006b5f", "#3796f4", "#70f5e0", "#aec6ff", "#cadaff", "#c4c6d0"];

export function CategoryDonut({ data, total }: { data: CategorySpend[]; total: number }) {
  return (
    <div className="flex flex-col items-center gap-space-md pt-2 sm:flex-row">
      <div className="relative h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data.length ? data : [{ label: "No spend", amount: 1 }]} dataKey="amount" nameKey="label" innerRadius="62%" outerRadius="100%" stroke="none" startAngle={90} endAngle={-270} isAnimationActive={false}>
              {(data.length ? data : [{}]).map((_, i) => (
                <Cell key={i} fill={data.length ? CATEGORY_COLORS[i % CATEGORY_COLORS.length] : "#e8edff"} />
              ))}
            </Pie>
            {data.length > 0 && <Tooltip formatter={(v) => formatINR(Number(v))} />}
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-label-sm text-[10px] font-semibold uppercase tracking-wider text-outline">Total</span>
          <span className="font-currency-md text-currency-md font-bold text-primary">{formatINRCompact(total)}</span>
        </div>
      </div>
      <ul className="w-full flex-1 space-y-2">
        {data.length === 0 && <li className="font-body-sm text-body-sm text-on-surface-variant">No submitted claims in this month yet.</li>}
        {data.map((c, i) => (
          <li key={c.code} className="flex items-center justify-between font-body-sm text-body-sm">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
              <span className="text-on-surface">{c.label}</span>
            </span>
            <span className="flex items-center gap-3 tabular-nums">
              <span className="font-semibold text-on-surface">{formatINR(c.amount)}</span>
              <span className="w-10 text-right text-on-surface-variant">{Math.round(c.percent)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
