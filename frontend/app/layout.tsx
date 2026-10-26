import type { Metadata, Viewport } from "next";
import { env } from "@/lib/env";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: "HisabLoop – Expenses in. Clarity out.",
    template: "%s | HisabLoop",
  },
  description:
    "HisabLoop collects bills on WhatsApp, routes approvals, batches reimbursements and gives your CA GST-ready records. Built for Indian businesses with 5–50 employees.",
  applicationName: "HisabLoop",
  openGraph: {
    type: "website",
    siteName: "HisabLoop",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0B2A5B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body className="bg-background font-body-md text-body-md text-on-surface antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
