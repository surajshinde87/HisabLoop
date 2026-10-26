import { api } from "@/lib/api-client";
import type { WhatsAppMessage, WhatsAppStatus } from "@/types/api";

/** Simulated WhatsApp channel. Messages are produced by the backend's MessagingGateway. */
export const messagingService = {
  status: (companyId: string) => api<WhatsAppStatus>(`/companies/${companyId}/whatsapp/status`),
  messages: (companyId: string, since?: string) =>
    api<WhatsAppMessage[]>(`/companies/${companyId}/whatsapp/messages`, { query: { since } }),
};
