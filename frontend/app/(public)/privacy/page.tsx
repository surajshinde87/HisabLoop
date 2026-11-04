import { PrivacyContent } from "@/components/public/privacy-policy";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/privacy",
  "Privacy Policy",
  "How HisabLoop collects, uses, stores and protects business and personal information.",
);

export default function Page() {
  return <PrivacyContent />;
}