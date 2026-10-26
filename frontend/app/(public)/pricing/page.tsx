import { PricingContent } from "@/components/public/generated/pricing-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/pricing", "Pricing", "Simple per-user plans for growing Indian teams: Starter ₹99, Growth ₹149 and Business ₹249 per user per month.");

export default function Page() {
  return <PricingContent />;
}
