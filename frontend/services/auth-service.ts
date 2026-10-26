import { api, buildUrl, refreshAccessToken } from "@/lib/api-client";
import { setAccessToken } from "@/lib/auth-token";
import type { AuthConfig, AuthResponse, Session } from "@/types/api";

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  companyName: string;
  gstin?: string;
  city?: string;
  state?: string;
  plan?: "STARTER" | "GROWTH" | "BUSINESS";
}

async function withToken(p: Promise<AuthResponse>): Promise<AuthResponse> {
  const res = await p;
  setAccessToken(res.accessToken);
  return res;
}

export const authService = {
  config: () => api<AuthConfig>("/auth/config", { noRefresh: true }),
  login: (email: string, password: string) =>
    withToken(api<AuthResponse>("/auth/login", { method: "POST", body: { email, password }, noRefresh: true })),
  register: (input: RegisterInput) =>
    withToken(api<AuthResponse>("/auth/register", { method: "POST", body: input, noRefresh: true })),
  acceptInvitation: (token: string, password: string, fullName?: string) =>
    withToken(
      api<AuthResponse>("/auth/accept-invitation", {
        method: "POST",
        body: { token, password, fullName },
        noRefresh: true,
      }),
    ),
  /** Restores a session from the HttpOnly refresh cookie (page reloads). */
  restore: () => refreshAccessToken(),
  me: () => api<Session>("/auth/me"),
  forgotPassword: (email: string) =>
    api<void>("/auth/forgot-password", { method: "POST", body: { email }, noRefresh: true }),
  resetPassword: (token: string, newPassword: string) =>
    api<void>("/auth/reset-password", { method: "POST", body: { token, newPassword }, noRefresh: true }),
  logout: async () => {
    try {
      await fetch(buildUrl("/auth/logout"), {
        method: "POST",
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
    } finally {
      setAccessToken(null);
    }
  },
};
