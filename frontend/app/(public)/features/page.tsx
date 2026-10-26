import { FeaturesContent } from "@/components/public/generated/features-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/features", "Features", "WhatsApp receipt capture, AI-assisted extraction, multi-level approvals, policy limits, GSTIN checks, reimbursement batches and CA-ready exports.");

export default function Page() {
  return <FeaturesContent />;
}
