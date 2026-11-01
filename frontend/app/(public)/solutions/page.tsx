import { SolutionsContent } from "@/components/public/generated/solutions-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/solutions",
  "Expense Claims for Small Businesses and Field Teams",
  "See how small businesses, startups, field teams and finance teams use HisabLoop to send bills on WhatsApp, get approvals and export clean records for their CA.",
);

export default function Page() {
  return <SolutionsContent />;
}