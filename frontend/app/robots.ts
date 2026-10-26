import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

const PRIVATE = ["/dashboard", "/claims", "/approvals", "/reimbursements", "/reports", "/policies", "/team", "/accountant", "/audit", "/whatsapp-simulator", "/login", "/register", "/forgot-password", "/reset-password", "/accept-invitation"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE }],
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}
