"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { errorMessage } from "@/lib/api-client";
import { invalidateClaimData, qk } from "@/lib/query-keys";
import type { ClaimDetail } from "@/types/api";

/**
 * Runs a claim mutation, writes the backend's returned claim into the cache and invalidates
 * every dependent view (list, inbox, dashboard, batches, audit).
 */
export function useClaimMutation<V>(companyId: string, fn: (v: V) => Promise<ClaimDetail>, success?: (c: ClaimDetail) => string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: async (claim) => {
      qc.setQueryData(qk.claim(companyId, claim.id), claim);
      await invalidateClaimData(qc, companyId);
      if (success) toast.success(success(claim));
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}
