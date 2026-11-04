import Link from "next/link";

const LEGAL_ENTITY = "HisabLoop Technologies";
const SUPPORT_EMAIL = "help@hisabloop.com";

export function TermsContent() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
      <header className="mb-10 border-b pb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: 1 November 2026</p>
        <div className="mt-6 space-y-3 leading-relaxed">
          <p>
            These Terms of Service explain how you can use HisabLoop, what you can expect from our services, and what
            responsibilities you have when using the platform.
          </p>
          <p>
            HisabLoop is an expense management platform that helps companies manage expense claims, approvals,
            reimbursements, and accounting records.
          </p>
          <p>
            By creating an account or using HisabLoop, you agree to these terms. If you are using the platform on behalf of a
            company, you confirm that you are authorised to accept these terms on its behalf.
          </p>
        </div>
      </header>

      <div className="space-y-10 leading-relaxed [&_a]:text-primary [&_a]:underline [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
        <div>
          <h2>1. About HisabLoop</h2>
          <p>Using HisabLoop, businesses can:</p>
          <ul>
            <li>Submit and manage employee expense claims.</li>
            <li>Upload receipts and organise expense records.</li>
            <li>Review and approve or reject expense requests.</li>
            <li>Prepare reimbursement records and reports.</li>
            <li>Give authorised accountants access to relevant financial information.</li>
          </ul>
        </div>

        <div>
          <h2>2. Your Account and Responsibilities</h2>
          <p>
            To use HisabLoop, you may need to create an account or receive an invitation from your company&apos;s administrator.
          </p>
          <p>When using the platform, you agree to:</p>
          <ul>
            <li>Provide accurate and up-to-date information.</li>
            <li>Keep your login credentials confidential.</li>
            <li>Avoid sharing your account with unauthorised individuals.</li>
            <li>Notify us if you suspect unauthorised access to your account.</li>
            <li>Use the platform only for legitimate business purposes.</li>
          </ul>
          <p>
            Company administrators are responsible for managing user access, assigning roles, and ensuring that employees and
            invited accountants have appropriate permissions.
          </p>
          <p>An accountant can access a company&apos;s workspace only when the company has explicitly granted that access.</p>
        </div>

        <div>
          <h2>3. How the Service Works</h2>
          <p>HisabLoop provides digital tools for recording, reviewing, and managing business expenses.</p>
          <p>
            The platform may process receipt images, extract expense information, organise claims, and generate reports to
            support business accounting workflows.
          </p>
          <p>Please note:</p>
          <ul>
            <li>Extracted receipt information may contain errors and should be reviewed before approval.</li>
            <li>Expense approvals are controlled by the company&apos;s authorised users.</li>
            <li>HisabLoop does not independently approve or pay employee reimbursements.</li>
            <li>Reimbursements are made by the company through its own payment arrangements.</li>
            <li>Creating a bank or payment record in HisabLoop does not initiate a bank transfer.</li>
          </ul>
          <p>HisabLoop is a software platform, not a bank, payment institution, or tax advisory service.</p>
        </div>

        <div>
          <h2>4. Your Business Data</h2>
          <p>Your company remains responsible for the business information and documents it uploads to HisabLoop.</p>
          <p>
            We process this information to provide the services you request, maintain your workspace, and support the
            platform&apos;s functionality.
          </p>
          <p>
            You are responsible for ensuring that you have the necessary rights and permissions to upload employee information,
            receipts, invoices, and other documents.
          </p>
          <p>We do not claim ownership of your uploaded business documents simply because you use our platform.</p>
          <p>
            For more information about how personal information is collected, used, stored, and protected, please read our{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </div>

        <div>
          <h2>5. Receipt Processing and Accounting Information</h2>
          <p>HisabLoop may use automated technologies to extract information from uploaded receipts and invoices.</p>
          <p>This may include:</p>
          <ul>
            <li>Merchant or vendor name.</li>
            <li>Transaction date.</li>
            <li>Expense amount.</li>
            <li>Tax information.</li>
            <li>Invoice or receipt details.</li>
          </ul>
          <p>
            Automated extraction is provided to save time and reduce manual work. However, the extracted information may not
            always be accurate.
          </p>
          <p>
            Users should verify important details before submitting, approving, or using them for accounting or tax-related
            purposes.
          </p>
          <p>HisabLoop does not replace professional accounting or tax advice.</p>
          <p>
            Any GSTIN validation or tax-related checks provided through the platform are subject to the availability and
            accuracy of the relevant information sources. Such checks should not be treated as a guarantee of tax compliance.
          </p>
        </div>

        <div>
          <h2>6. Plans, Billing and Payments</h2>
          <p>HisabLoop may offer different subscription plans depending on business requirements.</p>
          <p>
            Subscription charges, billing frequency, included features, and applicable taxes will be displayed on the{" "}
            <Link href="/pricing">pricing page</Link> or during the subscription process.
          </p>
          <p>Unless otherwise stated:</p>
          <ul>
            <li>Subscription fees are charged according to the selected plan.</li>
            <li>Applicable GST and other taxes may be added to the subscription price.</li>
            <li>The company administrator is responsible for managing the subscription.</li>
            <li>Changes to subscription plans may affect the applicable charges.</li>
            <li>Any cancellation or refund will be governed by the applicable subscription and refund policy.</li>
          </ul>
          <p>
            We will communicate material changes to subscription pricing before they take effect for existing customers,
            subject to applicable law.
          </p>
        </div>

        <div>
          <h2>7. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Upload fraudulent, misleading, or unlawful documents.</li>
            <li>Use the platform to submit false expense claims.</li>
            <li>Attempt to access another company&apos;s information without permission.</li>
            <li>Share confidential account credentials with unauthorised individuals.</li>
            <li>Interfere with the platform&apos;s functionality or security.</li>
            <li>Attempt to reverse-engineer, exploit, or disrupt the service.</li>
            <li>Use HisabLoop for activities that violate applicable laws.</li>
          </ul>
          <p>We may restrict or suspend access if we reasonably believe an account is being used in violation of these terms.</p>
        </div>

        <div>
          <h2>8. Data Security and Privacy</h2>
          <p>We use appropriate technical and organisational measures to protect information handled through HisabLoop.</p>
          <p>However, no internet-based service can guarantee absolute security.</p>
          <p>
            Users and company administrators should also take reasonable precautions, including protecting passwords and
            limiting access to authorised individuals.
          </p>
          <p>
            Our collection and handling of personal information are explained in our <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </div>

        <div>
          <h2>9. Service Availability and Maintenance</h2>
          <p>We aim to keep HisabLoop available and functioning reliably.</p>
          <p>However, temporary interruptions may occur due to:</p>
          <ul>
            <li>Scheduled maintenance.</li>
            <li>Software updates.</li>
            <li>Technical issues.</li>
            <li>Internet or third-party service interruptions.</li>
            <li>Events beyond our reasonable control.</li>
          </ul>
          <p>We will make reasonable efforts to restore services when interruptions occur.</p>
          <p>We do not guarantee uninterrupted or error-free availability at all times.</p>
        </div>

        <div>
          <h2>10. Account Suspension and Termination</h2>
          <p>You may stop using HisabLoop at any time, subject to your company&apos;s subscription arrangements.</p>
          <p>Company administrators can manage access for users within their workspace.</p>
          <p>We may suspend or terminate access where:</p>
          <ul>
            <li>These terms have been materially violated.</li>
            <li>An account is involved in fraudulent or unlawful activity.</li>
            <li>Subscription payments remain unpaid, where applicable.</li>
            <li>Continued access creates a security or legal risk.</li>
          </ul>
          <p>Where reasonably possible, we will notify the relevant administrator before taking such action.</p>
          <p>
            Information associated with terminated accounts will be handled according to our{" "}
            <Link href="/privacy">Privacy Policy</Link> and applicable data retention requirements.
          </p>
        </div>

        <div>
          <h2>11. Intellectual Property</h2>
          <p>
            HisabLoop&apos;s software, design, branding, interface, and original content belong to HisabLoop or its respective
            licensors.
          </p>
          <p>
            You are granted a limited, non-exclusive, non-transferable right to use the platform for its intended business
            purposes while your account or subscription remains active.
          </p>
          <p>You may not copy, distribute, resell, or commercially exploit the platform without prior written permission.</p>
          <p>Your ownership of uploaded business information and documents remains unaffected by this section.</p>
        </div>

        <div>
          <h2>12. Limitation of Liability</h2>
          <p>HisabLoop provides software tools to support expense management and accounting workflows.</p>
          <p>
            We are not responsible for business decisions made solely on the basis of automatically extracted information,
            reports, or suggestions generated by the platform.
          </p>
          <p>
            To the extent permitted by applicable law, HisabLoop will not be liable for indirect or consequential losses arising
            from the use or inability to use the service.
          </p>
          <p>Nothing in these terms excludes liability that cannot legally be excluded under applicable law.</p>
        </div>

        <div>
          <h2>13. Changes to These Terms</h2>
          <p>We may update these Terms of Service as our platform, features, or legal requirements change.</p>
          <p>
            Whenever we make a material change, we will update the revision date and take reasonable steps to notify affected
            customers.
          </p>
          <p>
            Your continued use of HisabLoop after the updated terms take effect will be subject to the revised terms, where
            permitted by law.
          </p>
        </div>

        <div>
          <h2>14. Governing Law and Disputes</h2>
          <p>These terms will be governed by the laws of India, subject to applicable legal requirements.</p>
          <p>
            If you have a concern or dispute, we encourage you to contact us first so that we can try to resolve it through
            discussion.
          </p>
          {/* TODO: replace with the specific courts / dispute resolution procedure for the registered location */}
          <p>
            The appropriate courts and dispute resolution procedures must be specified in accordance with the company&apos;s
            registered location and applicable law.
          </p>
        </div>

        <div>
          <h2>15. Contact Us</h2>
          <p>For questions about these terms, contact us:</p>
          <ul>
            <li>
              <strong>Product:</strong> HisabLoop
            </li>
            <li>
              <strong>Support email:</strong> {SUPPORT_EMAIL}
            </li>
            <li>
              <strong>Legal entity:</strong> {LEGAL_ENTITY}
            </li>
          </ul>
          <p>For questions about your account, subscription, data, or these terms, please contact our support team.</p>
        </div>

      </div>
    </main>
  );
}