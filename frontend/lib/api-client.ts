import { env } from "@/lib/env";
import { getAccessToken, setAccessToken } from "@/lib/auth-token";
import type { AuthResponse } from "@/types/api";

/** Error thrown for any non-2xx response, carrying the server's Problem Details. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

type Query = Record<string, string | number | boolean | string[] | null | undefined>;

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
  form?: FormData;
  /** Skip the automatic refresh-and-retry on 401 (used by auth endpoints). */
  noRefresh?: boolean;
  signal?: AbortSignal;
}

let sessionExpiredHandler: (() => void) | null = null;

/** Called once when a refresh fails, so the auth provider can redirect to /login. */
export function onSessionExpired(handler: () => void): void {
  sessionExpiredHandler = handler;
}

export function buildUrl(path: string, query?: Query): string {
  const url = new URL(env.apiBaseUrl + path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      if (Array.isArray(value)) value.forEach((v) => url.searchParams.append(key, v));
      else url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

let refreshInFlight: Promise<boolean> | null = null;

/** Exchanges the HttpOnly refresh cookie for a new access token. Single-flight. */
export async function refreshAccessToken(): Promise<AuthResponse | null> {
  try {
    const res = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      credentials: "include",
      headers: { "X-Requested-With": "XMLHttpRequest" },
    });
    if (!res.ok) {
      setAccessToken(null);
      return null;
    }
    const body = (await res.json()) as AuthResponse;
    setAccessToken(body.accessToken);
    return body;
  } catch {
    return null;
  }
}

async function refreshOnce(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken()
      .then((r) => r !== null)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

async function toApiError(res: Response): Promise<ApiError> {
  let code = "http_" + res.status;
  let message = res.statusText || "Request failed";
  let fieldErrors: Record<string, string> = {};
  try {
    const body = (await res.json()) as { code?: string; detail?: string; errors?: Record<string, string> };
    if (body.code) code = body.code;
    if (body.detail) message = body.detail;
    if (body.errors) fieldErrors = body.errors;
  } catch {
    // non-JSON error body
  }
  if (res.status >= 500) message = "Something went wrong on our side. Please try again.";
  return new ApiError(res.status, code, message, fieldErrors);
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let body: BodyInit | undefined;
  if (options.form) {
    body = options.form;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }
  return fetch(buildUrl(path, options.query), {
    method: options.method ?? (body ? "POST" : "GET"),
    headers,
    body,
    credentials: "include",
    signal: options.signal,
  });
}

async function request(path: string, options: RequestOptions = {}): Promise<Response> {
  let res: Response;
  try {
    res = await send(path, options);
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw new ApiError(0, "network_error", "Cannot reach the HisabLoop server. Check your connection and try again.");
  }
  if (res.status === 401 && !options.noRefresh) {
    const refreshed = await refreshOnce();
    if (refreshed) {
      res = await send(path, options);
    } else {
      sessionExpiredHandler?.();
    }
  }
  if (!res.ok) throw await toApiError(res);
  return res;
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await request(path, options);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Downloads a file response and lets the browser save it. Returns the filename used. */
export async function downloadFile(path: string, query?: Query, fallbackName = "download"): Promise<string> {
  const res = await request(path, { query });
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(disposition);
  const filename = match?.[1] ? decodeURIComponent(match[1]) : fallbackName;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return filename;
}

/** Fetches a protected binary (receipt image/PDF) as an object URL for previews. */
export async function fetchObjectUrl(path: string): Promise<{ url: string; type: string }> {
  const res = await request(path);
  const blob = await res.blob();
  return { url: URL.createObjectURL(blob), type: blob.type };
}

export function errorMessage(e: unknown, fallback = "Something went wrong"): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error && e.message) return e.message;
  return fallback;
}
