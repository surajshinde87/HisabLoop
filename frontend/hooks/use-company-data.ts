"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { policyService } from "@/services/policy-service";
import { companyService } from "@/services/company-service";
import { teamService } from "@/services/team-service";

export function useCategories() {
  return useQuery({ queryKey: qk.categories, queryFn: policyService.categories, staleTime: Infinity });
}

export function useNavCounts(companyId: string | null) {
  return useQuery({
    queryKey: qk.navCounts(companyId ?? ""),
    queryFn: () => companyService.navCounts(companyId as string),
    enabled: Boolean(companyId),
    refetchInterval: 60_000,
  });
}

export function useDirectory(companyId: string, enabled = true) {
  return useQuery({ queryKey: qk.directory(companyId), queryFn: () => teamService.directory(companyId), enabled, staleTime: 5 * 60_000 });
}
