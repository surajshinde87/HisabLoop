import { FaqContent } from "@/components/public/generated/faq-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/faq", "FAQ & Help Center", "Answers about WhatsApp submission, GST and GSTIN checks, approvals, reimbursements, security and Tally exports.");

export default function Page() {
  return <FaqContent />;
}
