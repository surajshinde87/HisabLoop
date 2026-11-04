import { HomeContent } from "@/components/public/generated/home-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/", "Expense management on WhatsApp for Indian businesses", "Collect bills on WhatsApp, approve expense claims and give your CA clean records with GST details.");

export default function Page() {
  return <HomeContent />;
}
