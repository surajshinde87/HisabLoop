import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

const PUBLIC_ROUTES = ["/", "/features", "/how-it-works", "/pricing", "/solutions", "/accountants", "/about", "/contact", "/faq", "/privacy", "/terms"];

/** Public marketing pages only; authenticated app routes are never listed. */
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((path) => ({
    url: `${env.siteUrl}${path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
