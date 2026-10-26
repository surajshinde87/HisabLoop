"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { Logo } from "@/components/brand/logo";
import { EmptyState, Spinner } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-provider";
import type { Permission } from "@/types/api";

/**
 * Client-side route protection for the workspace. This is a UX convenience only: every API call
 * is authorised again by the Spring Boot backend.
 */
export function AppGate({ children }: { children: ReactNode }) {
  const { status, session, workspace, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "anonymous") router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [status, router, pathname]);

  if (status !== "authenticated" || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface">
        <Logo variant="app" href={null} />
        <Spinner />
      </div>
    );
  }
  if (!workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6">
        <EmptyState
          icon="domain_disabled"
          title="No active workspace"
          description="Your account is not a member of any active company yet. Ask your company administrator for an invitation."
          action={<Button variant="ghost" onClick={() => void logout()}>Log out</Button>}
        />
      </div>
    );
  }
  return <AppShell>{children}</AppShell>;
}

/** Hides a page body when the current role lacks the permission (the API enforces it too). */
export function RequirePermission({ permission, children }: { permission: Permission; children: ReactNode }) {
  const { can } = useAuth();
  if (!can(permission)) {
    return (
      <EmptyState
        icon="lock"
        title="You don't have access to this page"
        description="Your role in this company does not include this area. Ask a company administrator if you need access."
        className="mt-16"
      />
    );
  }
  return <>{children}</>;
}
