import { api } from "@/lib/api-client";
import type { Category, Policy, PolicyInput } from "@/types/api";

export const policyService = {
  categories: () => api<Category[]>("/categories"),
  get: (companyId: string) => api<Policy>(`/companies/${companyId}/policies`),
  update: (companyId: string, input: PolicyInput) =>
    api<Policy>(`/companies/${companyId}/policies`, { method: "PUT", body: input }),
};
