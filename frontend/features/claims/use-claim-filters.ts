"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { ClaimFilters, ClaimStatus } from "@/types/api";

const STATUSES: ClaimStatus[] = ["DRAFT", "CONFIRMED", "PENDING_APPROVAL", "APPROVED", "REJECTED", "IN_BATCH", "PAID"];

/** Parses claim filters from the URL so filtered views can be bookmarked and shared. */
export function parseClaimFilters(params: URLSearchParams): ClaimFilters {
  const status = params.getAll("status").filter((s): s is ClaimStatus => STATUSES.includes(s as ClaimStatus));
  const page = Number(params.get("page") ?? "0");
  return {
    q: params.get("q") ?? undefined,
    status: status.length ? status : undefined,
    category: params.get("category") ?? undefined,
    employeeId: params.get("employeeId") ?? undefined,
    from: params.get("from") ?? undefined,
    to: params.get("to") ?? undefined,
    flagged: params.get("flagged") === "true",
    page: Number.isFinite(page) && page >= 0 ? page : 0,
    size: 20,
    sort: params.get("sort") ?? undefined,
  };
}

export function filtersToParams(f: ClaimFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  f.status?.forEach((s) => p.append("status", s));
  if (f.category) p.set("category", f.category);
  if (f.employeeId) p.set("employeeId", f.employeeId);
  if (f.from) p.set("from", f.from);
  if (f.to) p.set("to", f.to);
  if (f.flagged) p.set("flagged", "true");
  if (f.page) p.set("page", String(f.page));
  if (f.sort) p.set("sort", f.sort);
  return p;
}

export function useClaimFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = useMemo(() => parseClaimFilters(new URLSearchParams(params.toString())), [params]);
  const update = useCallback(
    (patch: Partial<ClaimFilters>, resetPage = true) => {
      const next = { ...filters, ...patch, ...(resetPage && !("page" in patch) ? { page: 0 } : {}) };
      const qs = filtersToParams(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [filters, router, pathname],
  );
  return { filters, update };
}
