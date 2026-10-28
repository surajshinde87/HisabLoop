import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/feedback";

type Tone = "navy" | "teal" | "blue" | "danger" | "muted";

const TONES: Record<Tone, { value: string; chip: string; bar: string; label: string }> = {
  navy: { value: "text-primary", chip: "bg-surface-container text-primary", bar: "bg-gradient-to-r from-primary via-secondary to-secondary-container opacity-80", label: "text-outline" },
  teal: { value: "text-secondary", chip: "bg-secondary-fixed/50 text-secondary", bar: "bg-secondary opacity-70", label: "text-outline" },
  blue: { value: "text-primary", chip: "bg-surface-container-high text-on-tertiary-fixed-variant", bar: "bg-on-tertiary-container opacity-60", label: "text-outline" },
  danger: { value: "text-error", chip: "bg-error-container/60 text-error", bar: "bg-error opacity-80", label: "text-error" },
  muted: { value: "text-primary", chip: "bg-surface-container-low text-primary-container", bar: "bg-secondary-fixed opacity-70", label: "text-outline" },
};

/** KPI card: label, big value, icon chip, footer, coloured bottom bar. */
export function KpiCard({
  label,
  value,
  icon,
  tone = "navy",
  footer,
  badge,
  loading,
  href,
}: {
  label: string;
  value: ReactNode;
  icon: string;
  tone?: Tone;
  footer?: ReactNode;
  badge?: ReactNode;
  loading?: boolean;
  href?: string;
}) {
  const t = TONES[tone];
  const body = (
    <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="min-w-0 space-y-1">
          <p className={cn("font-label-sm text-label-sm font-semibold uppercase tracking-wider", t.label)}>{label}</p>
          {loading ? (
            <Skeleton className="h-9 w-32" />
          ) : (
            <p className={cn("truncate font-currency-display text-currency-display", t.value)}>{value}</p>
          )}
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", t.chip)}>
          <Icon name={icon} className="text-[22px]" />
        </div>
      </div>
      {(footer || badge) && (
        <div className="mt-3 flex items-center justify-between gap-2 pt-3">
          <div className="min-w-0 font-label-md text-label-md">{loading ? <Skeleton className="h-4 w-40" /> : footer}</div>
          {badge}
        </div>
      )}
      <div className={cn("absolute bottom-0 left-0 right-0 h-1", t.bar)} />
    </div>
  );
  return href ? (
    <a href={href} className="block focus-visible:rounded-xl">
      {body}
    </a>
  ) : (
    body
  );
}

export function Pill({ children, tone = "muted", className }: { children: ReactNode; tone?: "muted" | "teal" | "danger" | "warning" | "navy"; className?: string }) {
  const tones = {
    muted: "bg-surface-container text-on-surface-variant",
    teal: "bg-secondary-fixed/40 text-on-secondary-fixed-variant",
    danger: "bg-error-container text-on-error-container",
    warning: "bg-warning-soft text-warning-text",
    navy: "bg-surface-container-highest text-on-primary-container",
  };
  return <span className={cn("whitespace-nowrap rounded-full px-2 py-0.5 font-label-sm text-label-sm font-semibold", tones[tone], className)}>{children}</span>;
}
