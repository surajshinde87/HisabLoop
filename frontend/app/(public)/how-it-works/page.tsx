import { HowItWorksContent } from "@/components/public/generated/how-it-works-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/how-it-works", "How It Works", "From a bill on WhatsApp to an approved, reimbursed claim, in four steps.");

export default function Page() {
  return <HowItWorksContent />;
}
