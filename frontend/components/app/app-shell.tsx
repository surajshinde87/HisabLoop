"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";

/** 240px fixed sidebar + 64px top bar. Below lg the sidebar is a drawer. */
export function AppShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();
  const [navPath, setNavPath] = useState(pathname);
  if (navPath !== pathname) {
    setNavPath(pathname);
    setNavOpen(false);
  }
  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased">
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(11,42,91,0.06)] lg:block">
        <AppSidebar />
      </aside>
      {navOpen && (
        <div className="fixed inset-0 z-[55] lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-primary/30" onClick={() => setNavOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-surface-container-lowest shadow-drawer">
            <AppSidebar onNavigate={() => setNavOpen(false)} />
          </aside>
        </div>
      )}
      <div className="lg:pl-64">
        <AppTopbar onOpenNav={() => setNavOpen(true)} />
        <main className="relative min-h-screen w-full bg-surface px-margin-mobile pt-16 md:px-space-lg">
          <div className="flex w-full flex-col space-y-space-xl pb-space-2xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
