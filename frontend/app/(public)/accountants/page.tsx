import { AccountantsContent } from "@/components/public/generated/accountants-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/accountants", "For Chartered Accountants", "A multi-client workspace for CA firms: GST-aware expense records, ITC review and clean exports from every client.");

export default function Page() {
  return <AccountantsContent />;
}
