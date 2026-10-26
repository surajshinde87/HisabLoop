import { HomeContent } from "@/components/public/generated/home-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/", "Expense management on WhatsApp for Indian businesses", "Collect bills on WhatsApp, approve expenses faster and keep GST-ready records for your CA — without chasing receipts or managing endless spreadsheets.");

export default function Page() {
  return <HomeContent />;
}
