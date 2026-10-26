import type { Metadata } from "next";

/** Per-page metadata with canonical URL and Open Graph tags. metadataBase comes from the root layout. */
export function pageMetadata(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} | HisabLoop`, description, url: path, type: "website", siteName: "HisabLoop", locale: "en_IN" },
    twitter: { card: "summary_large_image", title: `${title} | HisabLoop`, description },
  };
}
