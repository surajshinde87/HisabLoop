import { AboutContent } from "@/components/public/generated/about-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/about", "About Us", "Why we are building HisabLoop, a simple expense claim tool for Indian small businesses and their accountants.");

export default function Page() {
  return <AboutContent />;
}
