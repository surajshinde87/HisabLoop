import { api } from "@/lib/api-client";
import type { ClientDto, ClientSummary } from "@/types/api";

export const accountantService = {
  clients: () => api<ClientDto[]>("/accountant/clients"),
  summary: (companyId: string) => api<ClientSummary>(`/accountant/clients/${companyId}/summary`),
};
