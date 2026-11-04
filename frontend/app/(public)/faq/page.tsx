import { FaqContent } from "@/components/public/generated/faq-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/faq", "FAQ", "Answers about sending bills, approvals, GST, payments and exports.");

export default function Page() {
  return <FaqContent />;
}
