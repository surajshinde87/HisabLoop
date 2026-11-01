import type { ReactNode } from "react";
import { ContactForm } from "@/components/public/contact-form";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hisabloop.com";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

const h2Class =
  "font-headline-lg text-primary font-bold tracking-tight text-2xl sm:text-3xl lg:text-4xl leading-tight";

type Step = { who: string; icon: string; title: string; text: string };

const painPoints = [
  {
    icon: "forum",
    title: "Unorganized WhatsApp chats",
    text: "Receipts arrive scattered across individual chats and groups, requiring hours of manual sorting per client.",
  },
  {
    icon: "receipt_long",
    title: "Faded slips & missing GSTINs",
    text: "Thermal paper fades quickly, and receipts frequently lack readable GSTINs, invoice numbers, or CGST/SGST splits.",
  },
  {
    icon: "keyboard",
    title: "Tedious manual spreadsheet entry",
    text: "Staff re-type date, vendor, tax breakdown, and voucher amounts by hand, increasing the risk of data entry errors.",
  },
  {
    icon: "event_busy",
    title: "Month-end filing bottleneck",
    text: "Missing bills, unverifiable expenses, and client queries pile up right before GSTR filing deadlines.",
  },
];

const flow: Step[] = [
  {
    who: "Client Employee",
    icon: "photo_camera",
    title: "WhatsApp Capture",
    text: "Snaps a bill or PDF and sends it directly to the HisabLoop WhatsApp number. No app install required.",
  },
  {
    who: "HisabLoop Engine",
    icon: "document_scanner",
    title: "Field Extraction & Verification",
    text: "Extracts vendor, invoice date, amount, GSTIN, and tax split. The employee confirms values immediately in chat.",
  },
  {
    who: "Policy Engine",
    icon: "fact_check",
    title: "Validation & Flagging",
    text: "Identifies duplicate submissions, invalid GSTIN formats, and claims exceeding internal spending caps.",
  },
  {
    who: "Client Manager",
    icon: "how_to_reg",
    title: "1-Tap Approval",
    text: "Manager approves or queries the claim directly within their messaging chat with full context.",
  },
  {
    who: "Accountant (CA)",
    icon: "table_view",
    title: "Standardized Export",
    text: "Log in to your workspace to view verified vouchers and download audit-ready Excel/CSV ledger summaries.",
  },
];

const benefits: { icon: string; title: string; text: string; planned?: boolean }[] = [
  {
    icon: "groups",
    title: "Multi-Client Practice Dashboard",
    text: "Manage multiple client firms from a single login. Client company ledgers and records remain completely isolated.",
  },
  {
    icon: "table_view",
    title: "Standardized Excel & CSV Exports",
    text: "Get clear columns for date, vendor, GSTIN, category, taxable value, CGST, SGST, IGST, and approval status.",
  },
  {
    icon: "flag",
    title: "Exception-First Review",
    text: "Filter by flagged issues—like duplicate invoices or invalid GSTINs—so you only spend time on discrepancies.",
  },
  {
    icon: "history_edu",
    title: "Audit Trail & Original Receipts",
    text: "Inspect original receipt images alongside extracted data, approval timestamps, and employee edit logs.",
  },
  {
    icon: "inventory",
    title: "Statutory Bill Retention",
    text: "Receipt images and digital audit trails are securely archived to meet Indian statutory audit compliance periods.",
  },
  {
    icon: "assessment",
    title: "Automated GST ITC Summary",
    text: "Consolidated breakdown of eligible Input Tax Credit (ITC) with separated CGST, SGST, and IGST components.",
    planned: true,
  },
];

const flaggedChecks = [
  "Duplicate invoice submissions (matching amount, date, or vendor)",
  "Unregistered or incorrectly formatted GSTINs",
  "Expenses exceeding team or category budget caps",
  "Missing mandatory bill details or unreadable receipts",
];

const sampleClients = [
  { name: "Apex Logistics Pvt Ltd", claims: "18", flags: "2", status: "Ready to Export" },
  { name: "BlueSky Media Agency", claims: "34", flags: "0", status: "Ready to Export" },
  { name: "Zenith Health Clinics", claims: "12", flags: "3", status: "Needs Review" },
];

const partnerOffers = [
  {
    icon: "workspace_premium",
    title: "Free Partner Portal Access",
    text: "Zero subscription fees for CA firms managing their clients through the HisabLoop web workspace.",
  },
  {
    icon: "handshake",
    title: "Dedicated Onboarding Assistance",
    text: "Direct setup support to configure your clients' employee directories, categories, and approval paths.",
  },
  {
    icon: "forum",
    title: "Direct Product Input",
    text: "Work directly with our product team to shape export formats, ledger schemas, and compliance reporting.",
  },
  {
    icon: "savings",
    title: "Client Referral Benefits",
    text: "Special volume pricing discounts and partner incentives for practices introducing multiple client accounts.",
  },
];

const faqs = [
  {
    q: "Does HisabLoop replace our accounting software?",
    a: "No. HisabLoop acts as an intake and pre-accounting layer. It collects, reads, and validates expense receipts from your clients and provides clean, structured Excel and CSV files formatted for entry into your accounting software. Direct two-way sync integrations are planned for future versions.",
  },
  {
    q: "Do our clients need to download or install a new app?",
    a: "No. Employees and managers submit receipts, verify details, and approve expenses entirely inside WhatsApp. Only you and the client's finance administrators use the browser-based web dashboard.",
  },
  {
    q: "Who remains responsible for filing GST returns?",
    a: "Your firm maintains full control. HisabLoop extracts GSTINs and tax splits as an operational aid to ensure source documents are legible and organized. Final tax classification, reconciliation, and statutory filing remain with the accountant.",
  },
  {
    q: "Can my practice manage multiple independent businesses?",
    a: "Yes. The CA workspace provides a unified firm view to switch across client accounts while maintaining strict data isolation between companies.",
  },
];

export const accountantsJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/accountants#webpage`,
      url: `${SITE_URL}/accountants`,
      name: "HisabLoop for Chartered Accountants & Tax Practitioners",
      description:
        "Streamline client expense collection via WhatsApp. Eliminate manual receipt chasing, extract GST data automatically, and download structured Excel/CSV files.",
      inLanguage: "en-IN",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "HisabLoop",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "For Accountants", item: `${SITE_URL}/accountants` },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Building Blocks                                                           */
/* -------------------------------------------------------------------------- */

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`material-symbols-outlined select-none ${className}`}>
      {name}
    </span>
  );
}

function PlannedTag() {
  return (
    <span className="ml-2 inline-flex items-center rounded-full bg-surface-container px-2.5 py-0.5 align-middle text-xs font-medium text-on-surface-variant">
      Coming Soon
    </span>
  );
}

function Flow({ steps, label }: { steps: Step[]; label: string }) {
  return (
    <ol aria-label={label} className="grid grid-cols-1 lg:grid-cols-5 gap-3 lg:gap-2">
      {steps.map((s, i) => {
        const isLast = i === steps.length - 1;
        return (
          <li key={s.title} className="flex flex-col lg:flex-row items-stretch min-w-0">
            <div className="flex-1 rounded-xl bg-surface-container-lowest p-5 shadow-sm border border-outline-variant/30 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-surface-container text-primary flex items-center justify-center">
                    <Icon name={s.icon} className="text-xl" />
                  </div>
                  <span className="rounded-full bg-surface-container-low px-2.5 py-0.5 text-xs font-semibold text-on-surface-variant">
                    {s.who}
                  </span>
                </div>
                <h3 className="font-bold text-primary text-base">
                  <span className="sr-only">Step {i + 1}: </span>
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-on-surface-variant leading-relaxed">{s.text}</p>
              </div>
            </div>
            {!isLast && (
              <div
                aria-hidden="true"
                className="flex items-center justify-center text-outline py-2 lg:py-0 lg:px-1 shrink-0"
              >
                <Icon name="arrow_downward" className="lg:hidden text-lg" />
                <Icon name="arrow_forward" className="hidden lg:block text-lg" />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Wrapper({ children }: { children: ReactNode }) {
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>;
}

/* -------------------------------------------------------------------------- */
/*  Main View Component                                                       */
/* -------------------------------------------------------------------------- */

export function AccountantsContent() {
  return (
    <main className="w-full pt-16 sm:pt-20 bg-background flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(accountantsJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Hero */}
      <section aria-labelledby="ca-title" className="w-full bg-surface-container-low py-14 sm:py-20 lg:py-24 border-b border-outline-variant/20">
        <Wrapper>
          <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-4">
              Practice Management for CAs & Accountants
            </span>
            <h1
              id="ca-title"
              className="text-primary font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-tight"
            >
              Audit-ready client expense data without chasing receipts
            </h1>
            <p className="mt-5 text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-2xl">
              Your clients submit bills instantly over WhatsApp. HisabLoop validates GST details, flags exceptions, and delivers structured ledger summaries for your practice.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              <a
                href="#partner-form"
                className={`inline-flex items-center justify-center w-full sm:w-auto h-12 px-8 rounded-lg bg-primary text-on-primary font-semibold text-sm shadow hover:bg-primary/90 transition-all ${focusRing}`}
              >
                Join Partner Pilot
              </a>
              <a
                href="#how-it-works-ca"
                className={`inline-flex items-center justify-center w-full sm:w-auto h-12 px-8 rounded-lg bg-surface-container-lowest text-on-surface font-semibold text-sm border border-outline-variant/40 hover:bg-surface-container transition-all ${focusRing}`}
              >
                See Workflow
              </a>
            </div>
            <p className="mt-4 text-xs sm:text-sm text-on-surface-variant">
              Free pilot access available for practicing Chartered Accountants & tax consultants.
            </p>
          </div>
        </Wrapper>
      </section>

      {/* The Problem */}
      <section aria-labelledby="problem-title" className="w-full bg-surface py-14 sm:py-20">
        <Wrapper>
          <header className="max-w-2xl mb-10">
            <h2 id="problem-title" className={h2Class}>
              The month-end expense bottleneck
            </h2>
            <p className="mt-3 text-base text-on-surface-variant leading-relaxed">
              When clients rely on unstructured chats and paper slips, your staff spends critical filing days doing clerical entry rather than advisory.
            </p>
          </header>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {painPoints.map((p) => (
              <li key={p.title} className="rounded-xl bg-surface-container-low p-6 flex flex-col gap-3 border border-outline-variant/20">
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shadow-xs">
                  <Icon name={p.icon} className="text-xl" />
                </div>
                <h3 className="font-bold text-primary text-base">{p.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{p.text}</p>
              </li>
            ))}
          </ul>
        </Wrapper>
      </section>

      {/* Workflow */}
      <section
        id="how-it-works-ca"
        aria-labelledby="flow-title"
        className="w-full bg-surface-container-low py-14 sm:py-20 scroll-mt-20 border-y border-outline-variant/20"
      >
        <Wrapper>
          <header className="max-w-2xl mb-10">
            <h2 id="flow-title" className={h2Class}>
              How bills reach your practice
            </h2>
            <p className="mt-3 text-base text-on-surface-variant leading-relaxed">
              Clients capture expenses as they occur inside WhatsApp. You review verified, structured ledgers on the web.
            </p>
          </header>
          <Flow steps={flow} label="Process flow from receipt capture to accountant download" />
        </Wrapper>
      </section>

      {/* Benefits */}
      <section aria-labelledby="benefits-title" className="w-full bg-surface py-14 sm:py-20">
        <Wrapper>
          <header className="max-w-2xl mb-10">
            <h2 id="benefits-title" className={h2Class}>
              Designed for accounting practices
            </h2>
            <p className="mt-3 text-base text-on-surface-variant leading-relaxed">
              Streamline document intake, reduce follow-up queries, and keep clean audit documentation for every client.
            </p>
          </header>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <li key={b.title} className="min-w-0">
                <article className="h-full rounded-xl bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container text-secondary flex items-center justify-center">
                    <Icon name={b.icon} className="text-xl" />
                  </div>
                  <h3 className="font-bold text-primary text-lg flex items-center flex-wrap">
                    {b.title}
                    {b.planned && <PlannedTag />}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{b.text}</p>
                </article>
              </li>
            ))}
          </ul>
        </Wrapper>
      </section>

      {/* Practice Workspace Preview */}
      <section
        aria-labelledby="workspace-title"
        className="w-full bg-surface-container-low py-14 sm:py-20 border-y border-outline-variant/20"
      >
        <Wrapper>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 min-w-0">
              <h2 id="workspace-title" className={h2Class}>
                Single dashboard for all client firms
              </h2>
              <p className="mt-4 text-base text-on-surface-variant leading-relaxed">
                Switch across client entities instantly. View pending claim volumes, check pre-filing flags, and export clean data batches on demand.
              </p>
              <h3 className="mt-6 font-bold text-primary text-base">
                Automated Exception Checks
              </h3>
              <ul className="mt-3 flex flex-col gap-2.5">
                {flaggedChecks.map((flag) => (
                  <li key={flag} className="flex items-start gap-2 text-sm text-on-surface">
                    <Icon name="check_circle" className="text-secondary text-base mt-0.5 shrink-0" />
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            <figure className="lg:col-span-7 min-w-0">
              <div className="rounded-xl bg-surface-container-lowest p-4 sm:p-6 shadow-md border border-outline-variant/30">
                <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Sample Client Ledger Overview">
                  <table className="w-full min-w-[440px] text-left text-sm">
                    <thead>
                      <tr className="bg-surface-container-low text-primary text-xs font-semibold uppercase tracking-wider">
                        <th scope="col" className="px-4 py-3 rounded-l-lg">Client Entity</th>
                        <th scope="col" className="px-4 py-3">Pending Claims</th>
                        <th scope="col" className="px-4 py-3">Exceptions</th>
                        <th scope="col" className="px-4 py-3 rounded-r-lg">Batch Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30 text-on-surface">
                      {sampleClients.map((client) => (
                        <tr key={client.name} className="hover:bg-surface-container-lowest/80 transition-colors">
                          <th scope="row" className="px-4 py-3.5 font-semibold text-primary whitespace-nowrap">
                            {client.name}
                          </th>
                          <td className="px-4 py-3.5">{client.claims}</td>
                          <td className="px-4 py-3.5">
                            {client.flags !== "0" ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-error-container text-on-error-container">
                                {client.flags} flagged
                              </span>
                            ) : (
                              <span className="text-on-surface-variant text-xs">None</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap text-xs font-medium text-on-surface-variant">
                            {client.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <figcaption className="mt-2 text-center text-xs text-on-surface-variant">
                Preview of CA partner multi-entity review workspace.
              </figcaption>
            </figure>
          </div>
        </Wrapper>
      </section>

      {/* Partner Registration */}
      <section id="partner-form" aria-labelledby="partner-title" className="w-full bg-surface py-14 sm:py-20 scroll-mt-20">
        <Wrapper>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-5 min-w-0 flex flex-col">
              <h2 id="partner-title" className={h2Class}>
                Join the CA Partner Pilot
              </h2>
              <p className="mt-4 text-base text-on-surface-variant leading-relaxed">
                We are onboarding forward-thinking accounting practices to test HisabLoop with selected clients and help shape our export formatting.
              </p>
              <ul className="mt-6 flex flex-col gap-4">
                {partnerOffers.map((offer) => (
                  <li key={offer.title} className="flex items-start gap-3">
                    <div className="w-9 h-9 shrink-0 rounded-lg bg-surface-container text-secondary flex items-center justify-center">
                      <Icon name={offer.icon} className="text-lg" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-primary text-sm">
                        {offer.title}
                      </h3>
                      <p className="mt-0.5 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                        {offer.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-xl bg-surface-container-low p-4 text-xs text-on-surface-variant border border-outline-variant/30 leading-relaxed">
                <strong className="font-semibold text-primary">Compliance Note:</strong> HisabLoop is a data-intake and expense management software provider. It does not provide statutory audit, legal, or chartered accountancy services.
              </div>
            </div>

            <div className="lg:col-span-7 min-w-0">
              <div className="rounded-2xl bg-surface-container-lowest p-6 sm:p-8 shadow-md border border-outline-variant/30">
                <h3 className="text-xl font-bold text-primary">
                  Register Your Practice
                </h3>
                <p className="mt-1 mb-6 text-sm text-on-surface-variant">
                  Submit your firm details to get partner sandbox access and set up your first pilot client.
                </p>
                <ContactForm variant="partner" />
              </div>
            </div>
          </div>
        </Wrapper>
      </section>

      {/* FAQ */}
      <section aria-labelledby="ca-faq-title" className="w-full bg-surface-container-low py-14 sm:py-20 border-t border-outline-variant/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 id="ca-faq-title" className={`${h2Class} mb-8 text-center`}>
            Frequently Asked Questions
          </h2>
          <div className="flex flex-col gap-3">
            {faqs.map((f) => (
              <details key={f.q} name="ca-faq" className="group rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
                <summary
                  className={`flex items-center justify-between gap-4 p-5 list-none cursor-pointer rounded-xl font-semibold text-primary text-base ${focusRing}`}
                >
                  <span>{f.q}</span>
                  <Icon
                    name="expand_more"
                    className="shrink-0 text-on-surface-variant transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <p className="px-5 pb-5 text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/10 pt-3">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section aria-labelledby="ca-cta-title" className="w-full bg-surface py-14 sm:py-20">
        <Wrapper>
          <div className="bg-primary text-on-primary rounded-3xl p-8 sm:p-12 lg:p-16 text-center flex flex-col items-center gap-5 shadow-xl">
            <h2
              id="ca-cta-title"
              className="font-bold tracking-tight text-white max-w-2xl text-2xl sm:text-3xl lg:text-4xl leading-tight"
            >
              Start with a single pilot client
            </h2>
            <p className="text-base sm:text-lg text-white/90 max-w-xl leading-relaxed">
              Select one client with high monthly receipt volume. We will help configure their team so you can experience the month-end difference firsthand.
            </p>
            <a
              href="#partner-form"
              className={`inline-flex items-center justify-center h-12 px-8 rounded-lg bg-white text-primary font-bold text-sm shadow hover:bg-white/90 transition-all ${focusRing}`}
            >
              Request Partner Access
            </a>
          </div>
        </Wrapper>
      </section>
    </main>
  );
}