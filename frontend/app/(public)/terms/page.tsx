import { LegalPage } from "@/components/public/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/terms", "Terms of Service", "The terms that apply when a business uses HisabLoop.");

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="25 October 2026"
      intro="These terms govern use of HisabLoop by a customer company, its users and the accountants it invites."
    >
      <div>
        <h2>The service</h2>
        <p>
          HisabLoop records expense claims, routes them for approval, groups approved claims into reimbursement batches and
          produces reports. Creating a batch or a bank file does not transfer money; payments are made by the company through its
          own bank and then recorded in HisabLoop.
        </p>
      </div>
      <div>
        <h2>Accounts and roles</h2>
        <ul>
          <li>The company administrator controls who can access the workspace and with which role.</li>
          <li>Users must keep their credentials confidential and tell their administrator about any misuse.</li>
          <li>Accountants access only the companies that explicitly grant them access.</li>
        </ul>
      </div>
      <div>
        <h2>Customer data and accuracy</h2>
        <p>
          The company owns the data it submits. Extracted receipt details are suggestions that users review and confirm. GSTIN
          checks validate the format only and do not confirm registration status; input tax credit eligibility must be reviewed by
          the company or its accountant.
        </p>
      </div>
      <div>
        <h2>Plans and fees</h2>
        <p>Plans are priced per active user per month as shown on the pricing page, plus applicable GST.</p>
      </div>
      <div>
        <h2>Acceptable use</h2>
        <p>Do not upload unlawful content, attempt to access other companies&apos; data, or interfere with the service.</p>
      </div>
      <div>
        <h2>Liability and changes</h2>
        <p>
          Liability limits, governing law and dispute resolution will be set out here after legal review. We will notify
          administrators before material changes to these terms take effect.
        </p>
      </div>
    </LegalPage>
  );
}
