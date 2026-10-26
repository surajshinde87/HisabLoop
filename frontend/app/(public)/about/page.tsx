import { AboutContent } from "@/components/public/generated/about-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/about", "About Us", "The team building HisabLoop, the expense and reimbursement platform for Indian MSMEs and their accountants.");

export default function Page() {
  return <AboutContent />;
}
