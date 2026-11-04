import Link from "next/link";

const SERVICE_PROVIDER = "HisabLoop Technologies";
const PRIVACY_EMAIL = "help@hisabloop.com";

export function PrivacyContent() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
      <header className="mb-10 border-b pb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: 1 November 2026</p>
        <p className="mt-6 leading-relaxed">
          This policy explains what information HisabLoop collects, how we use it, who can see it, and the choices you have.
        </p>
      </header>

      <div className="space-y-10 leading-relaxed [&_a]:text-primary [&_a]:underline [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:font-semibold [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
      <div>
        <h2>1. Who We Are</h2>
        <p>
          HisabLoop is an expense management tool. Businesses use it to collect expense claims and receipts, approve them, and
          track reimbursements.
        </p>
        <p>This policy covers our website and the HisabLoop app.</p>
        <ul>
          <li>
            <strong>Service provider:</strong> {SERVICE_PROVIDER}
          </li>
        </ul>
      </div>

      <div>
        <h2>2. Information We Collect</h2>

        <h3>Account information</h3>
        <ul>
          <li>Your name, email address and, if you add it, mobile number.</li>
          <li>Your company&apos;s name, GSTIN and location, and your role in the company.</li>
        </ul>

        <h3>Expense information</h3>
        <ul>
          <li>Receipts and invoices you upload.</li>
          <li>Expense details such as merchant, date, amount, category and GST.</li>
          <li>Approval history and reimbursement status.</li>
        </ul>

        <h3>Technical information</h3>
        <ul>
          <li>IP address, used for sign-in security and to prevent abuse.</li>
          <li>Activity logs and error logs needed to run the service.</li>
        </ul>

        <h3>Enquiries</h3>
        <p>If you contact us or request a demo, we keep the details and message you send.</p>
      </div>

      <div>
        <h2>3. How We Use Your Information</h2>
        <ul>
          <li>To create and manage your account.</li>
          <li>To record, approve and report on expense claims.</li>
          <li>To give your company&apos;s admins, finance team and invited accountants the access they need.</li>
          <li>To keep accounts secure and investigate misuse.</li>
          <li>To answer support requests and improve HisabLoop.</li>
        </ul>
        <p>We do not sell your personal information.</p>
      </div>

      <div>
        <h2>4. Who Can Access Your Information?</h2>
        <p>
          Expense records in a company workspace are visible only to people that company has given access to. Depending on
          their role, this can include:
        </p>
        <ul>
          <li>Company admins.</li>
          <li>Employees, for their own claims.</li>
          <li>Approvers and finance team members.</li>
          <li>Chartered accountants the company has invited, with read-only access.</li>
        </ul>
      </div>

      <div id="security" className="scroll-mt-24">
        <h2>5. How We Protect Your Information</h2>
        <ul>
          <li>Password-protected accounts.</li>
          <li>Role-based permissions within each company.</li>
          <li>An audit log of key actions on claims.</li>
          <li>Protection of data while it is sent between your device and our servers.</li>
        </ul>
        <p>No online service can be fully secure, but we work to keep your information safe.</p>
      </div>

      <div>
        <h2>6. How Long We Keep Your Information</h2>
        <p>
          We keep information for as long as it is needed to provide the service, maintain business records, and meet legal
          obligations. After that, we delete or anonymise it.
        </p>
      </div>

      <div>
        <h2>7. Your Rights and Choices</h2>
        <p>Subject to applicable law, you can ask us to:</p>
        <ul>
          <li>Give you access to your personal information.</li>
          <li>Correct information that is wrong.</li>
          <li>Delete information, where the law allows.</li>
          <li>Withdraw consent you have given.</li>
        </ul>
        <p>
          If you use HisabLoop through your employer, contact your company admin first about changes to expense records.
        </p>
      </div>

      <div>
        <h2>8. Cookies</h2>
        <p>
          We use a cookie to keep you signed in, and your browser&apos;s local storage to remember the company workspace you last
          used. We do not use advertising cookies.
        </p>
        <p>You can clear these in your browser settings, but you will need to sign in again.</p>
      </div>

      <div>
        <h2>9. Third-Party Services</h2>
        <p>
          We use service providers, such as hosting providers, to run HisabLoop. They only process information as needed to
          provide their service to us.
        </p>
        <p>Websites we link to have their own privacy policies.</p>
      </div>

      <div>
        <h2>10. Changes to This Policy</h2>
        <p>
          When we update this policy, we will post the new version here with a new date. For significant changes, we will let
          affected users know.
        </p>
      </div>

      <div>
        <h2>11. Contact Us</h2>
        <p>For privacy questions or requests, get in touch:</p>
        <ul>
          <li>
            <strong>Company:</strong> {SERVICE_PROVIDER}
          </li>
          <li>
            <strong>Privacy contact:</strong> {PRIVACY_EMAIL}
          </li>
        </ul>
        <p>
          You can also use our <Link href="/contact">contact page</Link>.
        </p>
      </div>
      </div>
    </main>
  );
}
