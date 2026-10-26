import { api } from "@/lib/api-client";
import type { ContactInput } from "@/types/api";

export const contactService = {
  submit: (input: ContactInput) =>
    api<{ id: string; receivedAt: string }>("/public/contact", { method: "POST", body: input, noRefresh: true }),
};
