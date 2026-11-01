import { AccountantsContent } from "@/components/public/generated/accountants-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/accountants",
  "Expense Management for Chartered Accountants & Tax Professionals | HisabLoop",
  "Collect clean, GST-validated expense receipts from client teams via WhatsApp. Get organized Excel and CSV ledger summaries with zero receipt chasing.",
);

export default function Page() {
  return <AccountantsContent />;
}