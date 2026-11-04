import { AccountantsContent } from "@/components/public/generated/accountants-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/accountants",
  "For Chartered Accountants",
  "Your clients send bills on WhatsApp. You review claims with GST details and download Excel or CSV files.",
);

export default function Page() {
  return <AccountantsContent />;
}