import { SolutionsContent } from "@/components/public/generated/solutions-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/solutions", "Solutions", "How small businesses, startups, field teams and finance teams use HisabLoop to run expenses and reimbursements.");

export default function Page() {
  return <SolutionsContent />;
}
