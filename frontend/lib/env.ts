/** Public runtime configuration (inlined at build time by Next.js). */
export const env = {
  apiBaseUrl: (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1").replace(/\/$/, ""),
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  /** Development-only demo role cards on the login page. Never grants privileges by itself. */
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
} as const;
