"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Menu, MenuItem } from "@/components/ui/menu";
import { useAuth } from "@/features/auth/auth-provider";
import { NewClaimDialog } from "@/features/claims/new-claim-dialog";
import { ROLE_LABEL } from "@/features/roles";
import { useNavCounts } from "@/hooks/use-company-data";
import { firstName } from "@/lib/utils";

const TITLES: [string, string][] = [
  ["/dashboard", "Reimbursement Desk"],
  ["/claims", "Claims"],
  ["/approvals", "Approvals Inbox"],
  ["/reimbursements", "Reimbursement Batches"],
  ["/whatsapp-simulator", "WhatsApp Simulator"],
  ["/reports", "Reports & Exports"],
  ["/policies", "Expense Policies"],
  ["/audit", "Audit Log"],
  ["/team", "Team & Settings"],
  ["/accountant", "CA Partner Portal"],
];

export function AppTopbar({ onOpenNav }: { onOpenNav: () => void }) {
  const { session, workspace, selectCompany, logout, can, companyId } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [newClaimOpen, setNewClaimOpen] = useState(false);
  const { data: counts } = useNavCounts(companyId);
  if (!workspace || !session) return null;
  const title = TITLES.find(([p]) => pathname.startsWith(p))?.[1] ?? "";

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between gap-2 bg-surface-container-lowest/90 px-space-md shadow-[0_1px_8px_rgba(11,42,91,0.04)] backdrop-blur-md lg:left-64">
      <div className="flex min-w-0 items-center gap-space-sm">
        <button type="button" onClick={onOpenNav} className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low lg:hidden" aria-label="Open navigation">
          <Icon name="menu" />
        </button>
        <Menu
          label="Switch company"
          trigger={() => (
            <span className="flex items-center gap-1.5 rounded-lg bg-surface-container-low px-2.5 py-1.5 text-on-surface transition-colors hover:bg-surface-container">
              <Icon name="storefront" className="text-[18px] text-primary" />
              <span className="max-w-[120px] truncate font-label-lg text-label-lg font-semibold text-primary sm:max-w-[160px]">{workspace.companyName}</span>
              <Icon name="arrow_drop_down" className="text-[16px] text-on-surface-variant" />
            </span>
          )}
        >
          {(close) => (
            <>
              <p className="px-3 pb-1 pt-1.5 font-label-sm text-label-sm uppercase tracking-wider text-outline">Your workspaces</p>
              {session.workspaces.map((w) => (
                <MenuItem
                  key={w.companyId}
                  active={w.companyId === workspace.companyId}
                  onClick={() => {
                    selectCompany(w.companyId);
                    close();
                    router.push(w.kind === "CA_CLIENT" ? "/claims" : "/dashboard");
                  }}
                >
                  <Icon name={w.kind === "CA_CLIENT" ? "work" : "storefront"} className="text-[18px] text-on-surface-variant" />
                  <span className="flex-1 truncate">{w.companyName}</span>
                  <span className="font-label-sm text-label-sm text-outline">{ROLE_LABEL[w.role]}</span>
                </MenuItem>
              ))}
            </>
          )}
        </Menu>
        <span className="hidden font-body-sm text-body-sm text-outline md:inline">/</span>
        <span className="hidden truncate font-body-sm text-body-sm text-on-surface-variant md:inline">{title}</span>
      </div>

      {can("VIEW_CLAIMS") && (
        <form
          className="mx-space-md hidden max-w-md flex-1 xl:block"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/claims?q=${encodeURIComponent(search.trim())}`);
          }}
        >
          <div className="relative flex w-full items-center">
            <Icon name="search" className="absolute left-3 text-[18px] text-outline" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search claims"
              className="h-10 w-full rounded-lg bg-surface-container-low pl-9 pr-3 font-body-sm text-body-sm text-on-surface transition-colors placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none"
              placeholder="Search claims, employees, vendors (e.g. Uber, Swiggy)..."
              type="search"
            />
          </div>
        </form>
      )}

      <div className="flex items-center gap-space-sm">
        {can("CREATE_CLAIM") && (
          <button
            type="button"
            onClick={() => setNewClaimOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 font-label-lg text-label-lg text-on-primary shadow-[0_1px_3px_rgba(11,42,91,0.12)] transition-colors hover:bg-primary-container"
          >
            <Icon name="add" className="text-[18px]" />
            <span className="hidden sm:inline">New Claim</span>
          </button>
        )}
        {can("APPROVE_CLAIMS") && (
          <Link href="/approvals" className="relative rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface" aria-label={`Approvals${counts?.approvals ? `, ${counts.approvals} pending` : ""}`}>
            <Icon name="notifications" className="text-[20px]" />
            {Boolean(counts?.approvals) && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 font-label-sm text-[10px] font-bold leading-tight text-on-error">
                {counts?.approvals}
              </span>
            )}
          </Link>
        )}
        <Menu
          label="Account menu"
          align="right"
          trigger={() => (
            <span className="flex items-center gap-1.5 rounded-full bg-surface-container-low px-2.5 py-1.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container">
              <Icon name="account_circle" className="text-[16px] text-secondary" />
              <span className="hidden max-w-[170px] truncate sm:inline">
                {firstName(session.user.fullName)} ({ROLE_LABEL[workspace.role]})
              </span>
              <Icon name="expand_more" className="text-[14px] text-on-surface-variant" />
            </span>
          )}
        >
          {(close) => (
            <>
              <div className="px-3 py-2">
                <p className="font-label-lg text-label-lg text-on-surface">{session.user.fullName}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{session.user.email}</p>
              </div>
              <div className="my-1 h-px bg-brand-line" />
              {can("VIEW_TEAM") && (
                <MenuItem href="/team" onClick={close}>
                  <Icon name="settings" className="text-[18px] text-on-surface-variant" /> Team & Settings
                </MenuItem>
              )}
              <MenuItem
                onClick={() => {
                  close();
                  void logout();
                }}
              >
                <Icon name="logout" className="text-[18px] text-on-surface-variant" /> Log out
              </MenuItem>
            </>
          )}
        </Menu>
      </div>
      <NewClaimDialog open={newClaimOpen} onOpenChange={setNewClaimOpen} />
    </header>
  );
}
