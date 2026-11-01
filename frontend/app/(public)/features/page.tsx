import type { Metadata } from "next";
import { FeaturesContent } from "@/components/public/generated/features-content";

export const metadata: Metadata = {
  title: "Features: WhatsApp Expense Claims and Approvals",
  description:
    "See how HisabLoop handles WhatsApp bill capture, automatic bill reading, approvals, policy checks, GST details, reimbursement batches and accountant-ready exports.",
  alternates: { canonical: "/features" },
  openGraph: {
    title: "HisabLoop features: from bill to books",
    description:
      "WhatsApp bill capture, approvals, policy checks, GST details and Excel or CSV exports for small Indian teams and their accountants.",
    url: "/features",
    siteName: "HisabLoop",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HisabLoop features: from bill to books",
    description:
      "WhatsApp bill capture, approvals, policy checks, GST details and Excel or CSV exports for small Indian teams and their accountants.",
  },
};

export default function FeaturesPage() {
  return <FeaturesContent />;
}