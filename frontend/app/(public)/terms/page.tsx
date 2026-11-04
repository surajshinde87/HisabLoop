import { TermsContent } from "@/components/public/terms";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/terms",
  "Terms of Service",
  "The terms that apply when businesses, employees and accountants use HisabLoop for expense management.",
);

export default function Page() {
  return <TermsContent />;
}