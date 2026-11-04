import { ContactContent } from "@/components/public/generated/contact-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/contact", "Contact Us", "Book a demo, ask a question or join the CA partner pilot.");

export default function Page() {
  return <ContactContent />;
}
