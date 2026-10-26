"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/features/auth/auth-provider";
import { useNavCounts } from "@/hooks/use-company-data";
import { cn } from "@/lib/utils";
import type { Permission } from "@/types/api";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  iconClass?: string;
  show: (can: (p: Permission) => boolean, ctx: { member: boolean; caUser: boolean; admin: boolean }) => boolean;
  badge?: "claims" | "approvals" | "batches" | "demo";
}

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "dashboard", show: (can) => can("VIEW_CLAIMS") },
      { href: "/claims", label: "Claims", icon: "receipt_long", show: (can) => can("VIEW_CLAIMS"), badge: "claims" },
      { href: "/approvals", label: "Approvals", icon: "check_circle", show: (can) => can("APPROVE_CLAIMS"), badge: "approvals" },
      { href: "/reimbursements", label: "Reimbursements", icon: "payments", show: (can) => can("VIEW_REIMBURSEMENTS"), badge: "batches" },
      { href: "/whatsapp-simulator", label: "WhatsApp Simulator", icon: "chat", iconClass: "text-secondary", show: (_c, x) => x.member, badge: "demo" },
    ],
  },
  {
    title: "Finance",
    items: [
      { href: "/reports", label: "Reports & Exports", icon: "description", show: (can) => can("VIEW_REPORTS") },
      { href: "/policies", label: "Policies", icon: "verified_user", show: (can) => can("VIEW_POLICIES") },
      { href: "/audit", label: "Audit Log", icon: "history", show: (can) => can("VIEW_AUDIT") },
    ],
  },
  {
    title: "Management",
    items: [
      { href: "/team", label: "Team & Settings", icon: "group", show: (can) => can("VIEW_TEAM") },
      { href: "/accountant", label: "CA Partner Portal", icon: "work", show: (_c, x) => x.caUser || x.admin },
    ],
  },
];

const PLAN_LABEL = { STARTER: "Starter Plan", GROWTH: "Growth Plan", BUSINESS: "Business Plan" } as const;

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { workspace, session, can, companyId } = useAuth();
  const { data: counts } = useNavCounts(companyId);
  if (!workspace) return null;
  const ctx = { member: workspace.kind === "MEMBER", caUser: Boolean(session?.user.caPartner), admin: workspace.role === "ADMIN" };

  const badge = (b: NavItem["badge"], active: boolean) => {
    if (!b) return null;
    if (b === "demo")
      return (
        <span className="rounded-full bg-secondary-fixed px-1.5 py-0.5 font-label-sm text-label-sm font-semibold text-on-secondary-fixed">Live Demo</span>
      );
    if (!counts) return null;
    if (b === "claims")
      return (
        <span className={cn("rounded-full px-1.5 py-0.5 font-label-sm text-label-sm font-semibold", active ? "bg-surface-container-lowest/70 text-on-surface" : "bg-surface-container-high text-on-surface")}>
          {counts.claims}
        </span>
      );
    if (b === "approvals" && counts.approvals > 0)
      return <span className="rounded-full bg-error-container px-1.5 py-0.5 font-label-sm text-label-sm font-semibold text-on-error-container">{counts.approvals} pending</span>;
    if (b === "batches" && counts.openBatches > 0)
      return (
        <span className="rounded-full bg-surface-container px-1.5 py-0.5 font-label-sm text-label-sm font-semibold text-on-surface-variant">
          {counts.openBatches} {counts.openBatches === 1 ? "batch" : "batches"}
        </span>
      );
    return null;
  };

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="p-space-md pb-space-sm">
          <Logo variant="app" href="/dashboard" />
        </div>
        <div className="flex-1 space-y-space-md overflow-y-auto px-space-sm py-space-xs">
          {SECTIONS.map((section) => {
            const items = section.items.filter((i) => i.show(can, ctx));
            if (items.length === 0) return null;
            return (
              <div key={section.title} className="space-y-1">
                <p className="px-space-sm font-label-sm text-label-sm uppercase tracking-wider text-outline">{section.title}</p>
                <nav className="space-y-1" aria-label={section.title}>
                  {items.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between rounded-lg px-space-sm py-2 transition-colors",
                          active
                            ? "bg-secondary-container font-semibold text-on-secondary-container"
                            : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <Icon name={item.icon} className={cn("text-[18px]", !active && item.iconClass)} />
                          <span className="font-body-md text-body-md">{item.label}</span>
                        </span>
                        {badge(item.badge, active)}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            );
          })}
        </div>
      </div>
      <div className="m-space-xs space-y-2 rounded-xl bg-surface-container-low p-space-sm">
        <div className="flex items-center justify-between">
          <span className="rounded bg-primary-container px-1.5 py-0.5 font-label-sm text-label-sm text-inverse-primary">{PLAN_LABEL[workspace.plan]}</span>
          <span className="flex items-center gap-1" title="WhatsApp channel runs in simulation mode until the Business API is configured">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            <span className="font-label-sm text-label-sm font-semibold text-secondary">Bot Simulated</span>
          </span>
        </div>
        <div className="overflow-hidden">
          <p className="truncate font-headline-sm text-body-md font-semibold text-on-surface">{workspace.companyName}</p>
          <p className="truncate font-label-sm text-label-sm text-outline">GSTIN: {workspace.gstin ?? "not set"}</p>
        </div>
      </div>
    </div>
  );
}
