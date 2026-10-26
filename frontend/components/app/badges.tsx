import { cn, initials } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import type { ClaimFlag, ClaimStatus } from "@/types/api";

/** Pill badges per DESIGN.md "Status Chips & Badges" (22px, 11px semibold). */
const STATUS: Record<ClaimStatus, { label: string; className: string; icon?: string }> = {
  DRAFT: { label: "Draft", className: "bg-surface-container text-on-surface-variant" },
  CONFIRMED: { label: "Confirmed", className: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
  PENDING_APPROVAL: { label: "Pending Approval", className: "bg-warning-soft text-warning-text" },
  APPROVED: { label: "Approved", className: "bg-success-soft text-success" },
  REJECTED: { label: "Rejected", className: "bg-danger-soft text-danger" },
  IN_BATCH: { label: "In Batch", className: "bg-surface-container-high text-on-primary-fixed-variant" },
  PAID: { label: "Paid", className: "bg-secondary-container/70 text-on-secondary-container", icon: "verified" },
};

export function statusLabel(s: ClaimStatus): string {
  return STATUS[s].label;
}

export function StatusBadge({ status, className }: { status: ClaimStatus; className?: string }) {
  const s = STATUS[status];
  return (
    <span className={cn("inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-full px-2 font-label-sm text-label-sm", s.className, className)}>
      {s.icon && <Icon name={s.icon} className="text-[13px]" />}
      {s.label}
    </span>
  );
}

const FLAGS: Record<ClaimFlag, { label: string; icon: string; className: string }> = {
  DUPLICATE: { label: "Duplicate", icon: "content_copy", className: "bg-danger-soft text-danger" },
  MISSING_GSTIN: { label: "Missing GSTIN", icon: "receipt_long", className: "bg-warning-soft text-warning-text" },
  INVALID_GSTIN: { label: "Invalid GSTIN", icon: "error", className: "bg-danger-soft text-danger" },
  POLICY_VIOLATION: { label: "Over Limit", icon: "warning", className: "bg-danger-soft text-danger" },
  NO_RECEIPT: { label: "No receipt", icon: "receipt", className: "bg-surface-container text-on-surface-variant" },
  CLARIFICATION_REQUESTED: { label: "Question", icon: "forum", className: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
};

export function flagLabel(f: ClaimFlag): string {
  return FLAGS[f].label;
}

export function FlagChips({ flags, max = 3, quiet = ["NO_RECEIPT"] }: { flags: ClaimFlag[]; max?: number; quiet?: ClaimFlag[] }) {
  const visible = flags.filter((f) => !quiet.includes(f));
  if (visible.length === 0) return <span className="font-body-sm text-body-sm text-outline">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.slice(0, max).map((f) => (
        <span key={f} className={cn("inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-full px-2 font-label-sm text-label-sm", FLAGS[f].className)}>
          <Icon name={FLAGS[f].icon} className="text-[13px]" />
          {FLAGS[f].label}
        </span>
      ))}
    </div>
  );
}

export const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  TRAVEL: { label: "Travel", icon: "local_taxi" },
  FOOD: { label: "Food", icon: "restaurant" },
  FUEL: { label: "Fuel", icon: "local_gas_station" },
  OFFICE: { label: "Office", icon: "inventory" },
  SOFTWARE: { label: "Software", icon: "memory" },
  CLIENT_ENTERTAINMENT: { label: "Client Ent.", icon: "handshake" },
  OTHER: { label: "Other", icon: "category" },
};

export function CategoryChip({ code }: { code: string }) {
  const meta = CATEGORY_META[code] ?? { label: code, icon: "category" };
  return (
    <span className="inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-full bg-surface-container-low px-2 font-label-sm text-label-sm text-on-surface">
      <Icon name={meta.icon} className="text-[14px] text-on-surface-variant" />
      {meta.label}
    </span>
  );
}

const AVATAR_TONES = [
  "bg-primary-container text-secondary-container",
  "bg-secondary text-white",
  "bg-surface-container-high text-primary",
  "bg-tertiary-container text-tertiary-fixed",
  "bg-secondary-fixed text-on-secondary-fixed",
];

export function Avatar({ name, size = "md", className }: { name: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const idx = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TONES.length;
  const sizes = { sm: "h-7 w-7 text-[11px]", md: "h-9 w-9 text-label-md", lg: "h-14 w-14 text-headline-sm" };
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold", AVATAR_TONES[idx], sizes[size], className)}
    >
      {initials(name)}
    </span>
  );
}
