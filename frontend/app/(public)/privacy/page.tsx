import { LegalPage } from "@/components/public/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/privacy", "Privacy Policy", "How HisabLoop collects, uses, stores and protects business and personal data.");

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="25 October 2026"
      intro="HisabLoop helps businesses manage employee expenses. This policy explains what we process when a company, its employees and its accountants use HisabLoop."
    >
      <div>
        <h2>Who is responsible</h2>
        <p>
          Each customer company decides which employees and accountants use HisabLoop and is responsible for the expense data it
          submits. HisabLoop processes that data on the company&apos;s behalf to provide the service.
        </p>
      </div>
      <div>
        <h2>What we process</h2>
        <ul>
          <li>Account details: name, business email, mobile number, role and team.</li>
          <li>Expense records: receipts and invoices you upload, vendor, amounts, GST details, payment mode and approval history.</li>
          <li>Company details: legal name, GSTIN, address and plan.</li>
          <li>Security logs: sign-in times and an audit trail of actions taken in the workspace.</li>
          <li>Contact form submissions: the details you enter when you ask for a demo or call-back.</li>
        </ul>
      </div>
      <div>
        <h2>How we use it</h2>
        <ul>
          <li>To extract receipt details, check them against your company&apos;s policy and route approvals.</li>
          <li>To prepare reimbursement batches and reports that your finance team and CA can export.</li>
          <li>To secure accounts, investigate misuse and keep the audit trail required for bookkeeping.</li>
          <li>To reply to enquiries you send us.</li>
        </ul>
      </div>
      <div>
        <h2>Sharing</h2>
        <p>
          Data is visible only to people your company authorises, including chartered accountants your company explicitly grants
          access to. We use infrastructure and, when configured by the company, OCR/AI and messaging providers to run the service;
          they process data only on our instructions. We do not sell personal data.
        </p>
      </div>
      <div id="security">
        <h2>Security</h2>
        <ul>
          <li>Passwords are stored as BCrypt hashes; sessions use short-lived tokens and HttpOnly cookies.</li>
          <li>Every company&apos;s data is isolated and every request is authorised on the server.</li>
          <li>Receipts are stored privately and only served to authorised users.</li>
          <li>Status changes are written to an append-only, hash-chained audit log.</li>
        </ul>
      </div>
      <div>
        <h2>Retention and your choices</h2>
        <p>
          Expense and audit records are kept for as long as the company needs them for statutory bookkeeping. Employees can ask
          their company administrator to correct their profile details. For other requests, write to the contact address below.
        </p>
      </div>
      <div>
        <h2>Contact</h2>
        <p>Questions about this policy can be sent through the contact page.</p>
      </div>
    </LegalPage>
  );
}
