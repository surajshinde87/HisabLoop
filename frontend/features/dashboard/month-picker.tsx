"use client";

import { Icon } from "@/components/ui/icon";
import { monthLabel, monthRange, shiftMonth, currentMonthInIndia } from "@/lib/format";
import { formatDate } from "@/lib/format";

export function MonthPicker({ value, onChange }: { value: string; onChange: (ym: string) => void }) {
  const { from, to } = monthRange(value);
  const isCurrent = value >= currentMonthInIndia();
  return (
    <div className="relative flex items-center rounded-lg bg-surface-container-lowest shadow-sm">
      <button type="button" onClick={() => onChange(shiftMonth(value, -1))} className="rounded-l-lg px-2 py-2 text-outline hover:bg-surface-container-low hover:text-primary" aria-label="Previous month">
        <Icon name="chevron_left" className="text-[18px]" />
      </button>
      <div className="flex items-center px-1 py-2">
        <Icon name="calendar_today" className="mr-2 text-[18px] text-primary" />
        <span className="font-label-lg text-label-lg text-on-surface">
          {formatDate(from).replace(/ \d{4}$/, "")} – {formatDate(to)}
        </span>
        <span className="ml-1.5 hidden font-label-sm text-label-sm text-outline sm:inline">({monthLabel(value)})</span>
      </div>
      <button
        type="button"
        disabled={isCurrent}
        onClick={() => onChange(shiftMonth(value, 1))}
        className="rounded-r-lg px-2 py-2 text-outline hover:bg-surface-container-low hover:text-primary disabled:opacity-30"
        aria-label="Next month"
      >
        <Icon name="chevron_right" className="text-[18px]" />
      </button>
    </div>
  );
}
