import { ContactContent } from "@/components/public/generated/contact-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/contact", "Contact Us & Book a Demo", "Book a 15-minute walkthrough, talk to sales or join the CA partner programme.");

export default function Page() {
  return <ContactContent />;
}
