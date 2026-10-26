import { HowItWorksContent } from "@/components/public/generated/how-it-works-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/how-it-works", "How It Works", "From a WhatsApp photo to a reimbursed, GST-ready ledger entry: see each step of the HisabLoop flow.");

export default function Page() {
  return <HowItWorksContent />;
}
