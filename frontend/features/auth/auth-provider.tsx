"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { onSessionExpired } from "@/lib/api-client";
import { authService } from "@/services/auth-service";
import type { Permission, Session, Workspace } from "@/types/api";

type Status = "idle" | "loading" | "authenticated" | "anonymous";

/** Marketing pages never need a session, so they never call the API. */
const PUBLIC_PREFIXES = ["/features", "/how-it-works", "/pricing", "/solutions", "/accountants", "/about", "/contact", "/faq", "/privacy", "/terms"];
function isPublicPath(path: string): boolean {
  return path === "/" || PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
}

interface AuthContextValue {
  status: Status;
  session: Session | null;
  workspace: Workspace | null;
  companyId: string | null;
  setSession: (s: Session) => void;
  selectCompany: (companyId: string) => void;
  reloadSession: () => Promise<void>;
  logout: () => Promise<void>;
  can: (p: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const COMPANY_KEY = "hl.company";

function readStoredCompany(): string | null {
  try {
    return window.localStorage.getItem(COMPANY_KEY);
  } catch {
    return null;
  }
}

function storeCompany(id: string): void {
  try {
    window.localStorage.setItem(COMPANY_KEY, id);
  } catch {
    // storage unavailable (private mode): selection just won't persist
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("idle");
  const [session, setSessionState] = useState<Session | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const qc = useQueryClient();
  const restored = useRef(false);

  const applySession = useCallback((s: Session) => {
    setSessionState(s);
    setStatus("authenticated");
    const stored = readStoredCompany();
    const pick = s.workspaces.find((w) => w.companyId === stored) ?? s.workspaces[0] ?? null;
    setCompanyId(pick?.companyId ?? null);
  }, []);

  useEffect(() => {
    if (restored.current || isPublicPath(pathname)) return;
    restored.current = true;
    setStatus((s) => (s === "idle" ? "loading" : s));
    authService
      .restore()
      .then((res) => {
        if (res) applySession(res.session);
        else setStatus((s) => (s === "authenticated" ? s : "anonymous"));
      })
      .catch(() => setStatus((s) => (s === "authenticated" ? s : "anonymous")));
  }, [applySession, pathname]);

  useEffect(() => {
    onSessionExpired(() => {
      setSessionState(null);
      setStatus("anonymous");
      qc.clear();
      router.replace("/login?expired=1");
    });
  }, [qc, router]);

  const selectCompany = useCallback(
    (id: string) => {
      storeCompany(id);
      setCompanyId(id);
    },
    [],
  );

  const reloadSession = useCallback(async () => {
    const s = await authService.me();
    applySession(s);
  }, [applySession]);

  const logout = useCallback(async () => {
    await authService.logout();
    setSessionState(null);
    setStatus("anonymous");
    qc.clear();
    router.replace("/login");
  }, [qc, router]);

  const workspace = useMemo(
    () => session?.workspaces.find((w) => w.companyId === companyId) ?? null,
    [session, companyId],
  );

  const can = useCallback((p: Permission) => Boolean(workspace?.permissions.includes(p)), [workspace]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, session, workspace, companyId, setSession: applySession, selectCompany, reloadSession, logout, can }),
    [status, session, workspace, companyId, applySession, selectCompany, reloadSession, logout, can],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** For pages inside the authenticated layout, where a workspace is guaranteed. */
export function useWorkspace(): Workspace & { can: (p: Permission) => boolean } {
  const { workspace, can } = useAuth();
  if (!workspace) throw new Error("No active workspace");
  return { ...workspace, can };
}
