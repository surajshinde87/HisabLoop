import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hisabloop.com";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

const h2Class =
  "font-headline-xl text-primary font-bold tracking-tight text-[26px] leading-[34px] sm:text-[32px] sm:leading-[40px] lg:text-[38px] lg:leading-[46px]";

/* -------------------------------------------------------------------------- */
/*  Content (single source of truth for the page and the structured data)     */
/* -------------------------------------------------------------------------- */

const painPoints = [
  {
    who: "Employees",
    icon: "person",
    text: "Keep paper slips and phone photos, fill in forms later, and wait to be paid back.",
  },
  {
    who: "Managers",
    icon: "how_to_reg",
    text: "Approve over calls and chat messages, with no limit check and no record of who said yes.",
  },
  {
    who: "Finance and owners",
    icon: "table_chart",
    text: "Open every image, re-type vendor, date, amount and tax into Excel, and spot duplicates from memory.",
  },
  {
    who: "Accountants",
    icon: "calculate",
    text: "Receive unreadable photos in bulk with GST details missing, then fix them at month end.",
  },
];

const steps = [
  {
    icon: "chat",
    title: "Send the bill",
    text: "The employee sends a photo or PDF of the bill to the HisabLoop WhatsApp number. There is no app to install.",
  },
  {
    icon: "document_scanner",
    title: "Check the details",
    text: "HisabLoop reads the vendor, date, amount, tax and GSTIN and shows them in the chat. The employee taps Yes or fixes what is wrong.",
  },
  {
    icon: "rule",
    title: "Approve in chat",
    text: "Limits, duplicates and missing GST details are checked first. The manager then gets an Approve, Reject or Ask card.",
  },
  {
    icon: "file_download",
    title: "Pay and export",
    text: "Approved claims are grouped into a reimbursement batch. Finance pays from a bank transfer file, and the accountant gets an Excel or CSV export.",
  },
];

type Status = "Core" | "Planned";

const features: { icon: string; title: string; text: string; status: Status }[] = [
  {
    icon: "sms",
    title: "Capture and reading on WhatsApp",
    text: "Employees send bills where they already chat. OCR and an AI model fill in the fields, and the employee confirms before anything is submitted.",
    status: "Core",
  },
  {
    icon: "content_copy",
    title: "Duplicate and limit checks",
    text: "A bill sent twice, or a claim above the limit for that category and role, is flagged before the manager sees it.",
    status: "Core",
  },
  {
    icon: "bolt",
    title: "One-tap approvals",
    text: "Managers approve, reject or ask a question from WhatsApp. Reminders go out for claims that are still pending.",
    status: "Core",
  },
  {
    icon: "table_view",
    title: "Accountant-friendly exports",
    text: "Excel and CSV files with vendor, GSTIN, tax split and category in separate columns, so nothing is re-typed.",
    status: "Core",
  },
  {
    icon: "account_balance",
    title: "GST reports and accounting links",
    text: "Reports for taxable value, CGST, SGST, IGST and eligible ITC, plus Tally and Zoho Books integration.",
    status: "Planned",
  },
  {
    icon: "payments",
    title: "UPI payouts",
    text: "Pay approved claims by UPI through a licensed payment partner and see the payment status on each claim.",
    status: "Planned",
  },
];

const roles = [
  {
    icon: "corporate_fare",
    title: "Owners and founders",
    text: "See who is claiming what, under which category, and set simple limits instead of approving every bill by phone.",
  },
  {
    icon: "account_balance_wallet",
    title: "Finance teams",
    text: "Stop re-typing bills. Review a clean list, pay in one batch and download the records.",
  },
  {
    icon: "verified",
    title: "Chartered accountants",
    text: "Manage several client companies from one partner login and receive structured data instead of photos.",
  },
];

const care = [
  {
    icon: "admin_panel_settings",
    title: "Role-based access",
    text: "Employees, managers, admins and accountants see only what their role needs.",
  },
  {
    icon: "domain_verification",
    title: "Separate company data",
    text: "Each company's claims and bills are kept apart from every other company's.",
  },
  {
    icon: "lock",
    title: "Encryption",
    text: "Data is encrypted in transit and at rest.",
  },
  {
    icon: "history_edu",
    title: "Audit trail",
    text: "Every status change is recorded with who made it and when, and the original bill image is kept with the claim.",
  },
  {
    icon: "inventory",
    title: "Retention and deletion",
    text: "Bills are kept for the statutory period, which you can configure. Personal data requests are handled under India's DPDP Act.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "₹99",
    blurb: "For small teams that want bills captured and approved without the chasing.",
    items: [
      "Capture on WhatsApp",
      "Manager approval",
      "Basic category limits",
      "Excel and CSV export",
    ],
    cta: { label: "Join the pilot", href: "/register" },
    highlight: false,
  },
  {
    name: "Growth",
    price: "₹149",
    blurb: "For teams that need GST reports and tighter approval rules.",
    items: [
      "Everything in Starter",
      "Multi-level approval by amount",
      "GST reports (planned)",
      "Spend analytics (planned)",
    ],
    cta: { label: "Join the pilot", href: "/register" },
    highlight: true,
  },
  {
    name: "Business",
    price: "₹249",
    blurb: "For teams that want accounting integrations and payouts.",
    items: [
      "Everything in Growth",
      "Tally and Zoho Books integration (planned)",
      "UPI payouts (planned)",
      "Priority support",
    ],
    cta: { label: "Talk to us", href: "/contact" },
    highlight: false,
  },
];

const faqs = [
  {
    q: "Do employees need to install an app?",
    a: "No. Employees only use WhatsApp. They send a photo or PDF of a bill to the HisabLoop number, check the details the bot reads out, and tap Yes or Edit.",
  },
  {
    q: "How accurate is the bill reading?",
    a: "HisabLoop reads bills with OCR and an AI model, and every claim is shown to the employee to confirm before it moves on, so mistakes are caught at the start. Faded thermal slips and handwritten bills are the hardest. We are measuring accuracy with pilot teams rather than promising a single number.",
  },
  {
    q: "Can managers approve or reject claims?",
    a: "Yes. Managers get an approval card in chat with Approve, Reject and Ask options, and can ask the employee a question when something looks wrong. Claims that stay pending trigger reminders.",
  },
  {
    q: "Does HisabLoop handle GST and ITC?",
    a: "It captures the GSTIN, tax amount and CGST, SGST and IGST split from each bill and flags a missing or badly formatted GSTIN. The tax data is a working aid, and your accountant remains responsible for filing. GST reports and ITC summaries are planned after the first release.",
  },
  {
    q: "How are employees paid back?",
    a: "In the first release, finance downloads a bank transfer file for each approved batch and pays from it. Paying by UPI directly from HisabLoop is planned and will go through a licensed payment partner.",
  },
  {
    q: "Which accounting tools does it work with?",
    a: "The first release exports to Excel and CSV with accountant-friendly columns. Tally and Zoho Books integrations are planned.",
  },
  {
    q: "Who can see my company's data?",
    a: "Access depends on role, and each company's data is kept separate and encrypted. HisabLoop is being built to follow the consent and deletion requirements of India's Digital Personal Data Protection Act.",
  },
];

const sampleRows = [
  ["08 Oct 2026", "Uber", "27ABCDE1234F1Z5", "Travel", "₹1,180.95", "₹59.05", "₹1,240.00", "Approved"],
  ["09 Oct 2026", "Office Mart", "29ABCDE5678G1Z2", "Office", "₹2,542.37", "₹457.63", "₹3,000.00", "Pending approval"],
  ["10 Oct 2026", "Hotel Sunrise", "Missing", "Meals", "₹1,500.00", "None", "₹1,500.00", "Flagged: no GSTIN"],
];

const sampleColumns = [
  "Date",
  "Vendor",
  "GSTIN",
  "Category",
  "Taxable value",
  "GST",
  "Total",
  "Status",
];

/* -------------------------------------------------------------------------- */
/*  Structured data                                                           */
/* -------------------------------------------------------------------------- */

export const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "HisabLoop",
      url: SITE_URL,
      slogan: "Expenses in. Clarity out.",
      founder: { "@type": "Person", name: "Suraj Shinde" },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "HisabLoop",
      inLanguage: "en-IN",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      name: "HisabLoop",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, WhatsApp",
      description:
        "A WhatsApp-first expense claim platform for small Indian teams and their accountants. Employees send bills in chat, managers approve with one tap, and finance gets GST-aware exports.",
      publisher: { "@id": `${SITE_URL}/#organization` },
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
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  id,
  title,
  intro,
  center = true,
}: {
  id: string;
  title: string;
  intro?: ReactNode;
  center?: boolean;
}) {
  return (
    <header className={`max-w-3xl mb-10 sm:mb-14 ${center ? "mx-auto text-center" : ""}`}>
      <h2 id={id} className={h2Class}>
        {title}
      </h2>
      {intro ? (
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-4 leading-relaxed">
          {intro}
        </p>
      ) : null}
    </header>
  );
}

function StatusTag({ status }: { status: Status }) {
  const styles =
    status === "Core"
      ? "bg-secondary-fixed/40 text-on-secondary-fixed"
      : "bg-surface-container text-on-surface-variant";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-label-sm text-label-sm ${styles}`}>
      {status === "Core" ? "In the first release" : "Planned"}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export function HomeContent() {
  return (
    <main className="w-full pt-20 bg-background flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* ------------------------------ Hero ------------------------------ */}
      <section
        aria-labelledby="hero-title"
        className="relative w-full overflow-hidden bg-gradient-to-b from-surface via-surface-container-low/50 to-surface pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-28"
      >
        <div className="max-w-7xl mx-auto px-margin">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-gutter items-center">
            <div className="lg:col-span-6 min-w-0 flex flex-col items-start gap-5 sm:gap-6">
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm">
                <Icon name="all_inclusive" className="text-base" />
                Expenses in. Clarity out.
              </p>

              <h1
                id="hero-title"
                className="font-headline-xl text-primary font-bold tracking-tight text-[30px] leading-[38px] sm:text-[38px] sm:leading-[46px] lg:text-[46px] lg:leading-[54px]"
              >
                Collect bills on WhatsApp. Hand your accountant clean records.
              </h1>

              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                HisabLoop is an expense claim tool for small Indian teams. Employees send a photo of
                a bill, managers approve in chat, and finance and accountants get structured,
                GST-aware data instead of a month-end pile of images.
              </p>

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/register"
                  className={`inline-flex items-center justify-center h-12 px-6 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary transition-colors duration-200 ${focusRing}`}
                >
                  Join the pilot
                </Link>
                <a
                  href="#how-it-works"
                  className={`inline-flex items-center justify-center h-12 px-6 rounded-lg bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm hover:bg-surface-container transition-colors duration-200 ${focusRing}`}
                >
                  See how it works
                </a>
              </div>

              <ul className="flex flex-wrap items-center gap-2 pt-1">
                {[
                  "No app to install",
                  "Employee confirms every bill",
                  "Excel and CSV exports for your CA",
                ].map((t) => (
                  <li
                    key={t}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest shadow-sm text-on-surface font-label-sm text-label-sm"
                  >
                    <Icon name="check_circle" className="text-secondary text-sm" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Illustration: sample data only */}
            <figure className="lg:col-span-6 min-w-0 w-full max-w-lg mx-auto lg:max-w-none">
              <div
                aria-hidden="true"
                className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col gap-4"
              >
                <div className="bg-surface rounded-xl p-3.5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#25D366]/20 text-[#128C7E] flex items-center justify-center shrink-0">
                      <Icon name="chat" className="text-base" />
                    </div>
                    <span className="font-label-md text-label-md text-primary font-bold">
                      HisabLoop on WhatsApp
                    </span>
                  </div>
                  <div className="bg-[#DCF8C6]/60 p-3 rounded-lg">
                    <p className="font-body-md text-body-md font-medium text-primary break-words">
                      ₹1,240 · Uber · Travel · 8 Oct
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Is this correct?
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="flex-1 text-center py-1.5 px-3 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md">
                      Yes
                    </span>
                    <span className="py-1.5 px-4 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md">
                      Edit
                    </span>
                  </div>
                </div>

                <dl className="grid grid-cols-3 gap-2 bg-surface-container-low p-3 rounded-xl text-center">
                  <div className="min-w-0">
                    <dt className="font-label-sm text-label-sm text-on-surface-variant">Date</dt>
                    <dd className="font-body-md text-body-md text-primary font-semibold">8 Oct 2026</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="font-label-sm text-label-sm text-on-surface-variant">GST (5%)</dt>
                    <dd className="font-body-md text-body-md text-primary font-semibold">₹59.05</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="font-label-sm text-label-sm text-on-surface-variant">Total</dt>
                    <dd className="font-body-md text-body-md text-primary font-bold">₹1,240</dd>
                  </div>
                </dl>

                <div className="bg-surface rounded-xl p-3.5 flex flex-col gap-3">
                  <p className="font-label-md text-label-md text-primary">
                    <span className="font-bold">Approval request</span> · within travel limit, no
                    duplicate found
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-center py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md">
                      Approve
                    </span>
                    <span className="text-center py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md">
                      Reject
                    </span>
                    <span className="text-center py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md">
                      Ask
                    </span>
                  </div>
                </div>
              </div>
              <figcaption className="mt-3 text-center font-body-sm text-body-sm text-on-surface-variant">
                Illustration with sample data: the bot reads a bill, the employee confirms, and the
                manager approves in chat.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ----------------------------- Problem ---------------------------- */}
      <section
        aria-labelledby="problem-title"
        className="w-full bg-surface-container-low py-14 sm:py-20 lg:py-24"
      >
        <div className="max-w-7xl mx-auto px-margin grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-gutter">
          <div className="lg:col-span-5 min-w-0">
            <h2 id="problem-title" className={h2Class}>
              Expense claims should not mean chasing receipts
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-4 leading-relaxed">
              In many small businesses, bills arrive as WhatsApp photos, paper slips and Excel
              sheets. Each person in the chain loses time, and the accountant inherits the mess.
            </p>
          </div>

          <dl className="lg:col-span-7 min-w-0 flex flex-col divide-y divide-outline-variant/40">
            {painPoints.map((p) => (
              <div key={p.who} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-surface-container-lowest text-primary flex items-center justify-center shadow-sm">
                  <Icon name={p.icon} className="text-2xl" />
                </div>
                <div className="min-w-0">
                  <dt className="font-headline-sm text-headline-sm text-primary font-bold">{p.who}</dt>
                  <dd className="font-body-md text-body-md text-on-surface-variant mt-1 leading-relaxed">
                    {p.text}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* --------------------------- How it works ------------------------- */}
      <section
        id="how-it-works"
        aria-labelledby="how-title"
        className="w-full bg-surface py-14 sm:py-20 lg:py-24 scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-margin">
          <SectionHeader
            id="how-title"
            title="From bill to reimbursement in four steps"
            intro="Employees and managers stay in WhatsApp. Finance and accountants work in a web dashboard."
          />
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-gutter">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col gap-4 min-w-0"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center">
                    <Icon name={s.icon} className="text-2xl" />
                  </div>
                  <span aria-hidden="true" className="font-headline-lg text-headline-lg font-bold text-outline-variant">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-2">
                    <span className="sr-only">Step {i + 1}: </span>
                    {s.title}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------------------- Features ---------------------------- */}
      <section
        id="features"
        aria-labelledby="features-title"
        className="w-full bg-surface-container-low py-14 sm:py-20 lg:py-24 scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-margin">
          <SectionHeader
            id="features-title"
            title="What HisabLoop does"
            intro="Features marked “In the first release” make up the core product. Planned features follow once the pilot confirms what teams need most."
          />
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-gutter">
            {features.map((f) => (
              <li key={f.title} className="min-w-0">
                <article className="h-full bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-surface-container text-primary flex items-center justify-center">
                      <Icon name={f.icon} className="text-2xl" />
                    </div>
                    <StatusTag status={f.status} />
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-2">{f.title}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{f.text}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --------------------------- What the CA gets --------------------- */}
      <section
        aria-labelledby="export-title"
        className="w-full bg-surface py-14 sm:py-20 lg:py-24"
      >
        <div className="max-w-7xl mx-auto px-margin">
          <SectionHeader
            id="export-title"
            title="What your accountant receives"
            intro="One structured file instead of a folder of photos. Each claim keeps its original bill, the extracted fields and its approval history."
          />
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-3 sm:p-5">
            <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Sample export table, scrolls sideways on small screens">
              <table className="w-full min-w-[720px] text-left font-body-sm text-body-sm">
                <caption className="text-left px-2 pb-3 font-body-sm text-body-sm text-on-surface-variant">
                  Sample data, not real transactions.
                </caption>
                <thead>
                  <tr className="bg-surface-container-low text-primary">
                    {sampleColumns.map((c) => (
                      <th key={c} scope="col" className="px-3 py-2.5 font-semibold whitespace-nowrap">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-on-surface">
                  {sampleRows.map((row, idx) => (
                    <tr key={`${row[0] ?? ""}-${row[1] ?? ""}-${idx}`}>
                      {row.map((cell, i) => (
                        <td key={i} className="px-3 py-3 whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-4 max-w-3xl font-body-sm text-body-sm text-on-surface-variant">
            Extracted tax data is a working aid. Your accountant remains responsible for GST filing.
          </p>
        </div>
      </section>

      {/* ------------------------------ Roles ----------------------------- */}
      <section
        aria-labelledby="roles-title"
        className="w-full bg-surface-container-low py-14 sm:py-20 lg:py-24"
      >
        <div className="max-w-7xl mx-auto px-margin">
          <SectionHeader id="roles-title" title="Built for the people who touch every claim" />
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-gutter">
            {roles.map((r) => (
              <li key={r.title} className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm min-w-0">
                <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center mb-5">
                  <Icon name={r.icon} className="text-2xl" />
                </div>
                <h3 className="font-headline-md text-headline-md text-primary font-bold mb-2">{r.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --------------------------- Data care ---------------------------- */}
      <section
        aria-labelledby="care-title"
        className="w-full bg-surface py-14 sm:py-20 lg:py-24"
      >
        <div className="max-w-7xl mx-auto px-margin">
          <SectionHeader
            id="care-title"
            title="Your business records, handled with care"
            intro="These are the standards HisabLoop is being built to. An independent security review is planned before the paid launch."
          />
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {care.map((c) => (
              <li key={c.title} className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center">
                  <Icon name={c.icon} className="text-xl" />
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">{c.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{c.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ----------------------------- Pricing ---------------------------- */}
      <section
        id="pricing"
        aria-labelledby="pricing-title"
        className="w-full bg-surface-container-low py-14 sm:py-20 lg:py-24 scroll-mt-24"
      >
        <div className="max-w-6xl mx-auto px-margin">
          <SectionHeader
            id="pricing-title"
            title="Simple per-user pricing"
            intro="Planned prices in Indian rupees, per user per month. They may change as the pilot teaches us what teams value."
          />
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-gutter items-stretch">
            {plans.map((p) => (
              <li key={p.name} className="min-w-0">
                <article
                  className={`h-full rounded-2xl p-6 sm:p-8 flex flex-col justify-between bg-surface-container-lowest ${p.highlight ? "shadow-xl ring-2 ring-secondary" : "shadow-sm"
                    }`}
                >
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                      {p.name}
                      {p.highlight ? (
                        <span className="ml-2 align-middle rounded-full bg-secondary text-on-secondary px-2.5 py-0.5 font-label-sm text-label-sm">
                          Suggested for GST needs
                        </span>
                      ) : null}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 mb-5">{p.blurb}</p>
                    <p className="flex items-baseline gap-1 mb-6">
                      <span className="font-currency-display text-currency-display text-primary font-bold">
                        {p.price}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">per user per month</span>
                    </p>
                    <ul className="flex flex-col gap-3 text-on-surface font-body-sm text-body-sm">
                      {p.items.map((it) => (
                        <li key={it} className="flex items-start gap-2">
                          <Icon name="check" className="text-secondary text-base mt-0.5" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href={p.cta.href}
                    className={`mt-8 w-full h-11 rounded-lg flex items-center justify-center font-label-md text-label-md font-semibold transition-colors ${focusRing} ${p.highlight
                        ? "bg-primary-container text-on-primary hover:bg-primary shadow-md"
                        : "bg-surface-container text-primary hover:bg-surface-container-high"
                      }`}
                  >
                    {p.cta.label}
                  </Link>
                </article>
              </li>
            ))}
          </ul>
          <p className="text-center font-body-sm text-body-sm text-on-surface-variant mt-8">
            Pilot teams start with a free 30-day trial. Accountants can use a free partner account to
            manage their clients.
          </p>
        </div>
      </section>

      {/* ------------------------------- FAQ ------------------------------ */}
      <section
        id="faq"
        aria-labelledby="faq-title"
        className="w-full bg-surface py-14 sm:py-20 lg:py-24 scroll-mt-24"
      >
        <div className="max-w-3xl mx-auto px-margin">
          <SectionHeader id="faq-title" title="Questions teams ask first" />
          <div className="flex flex-col gap-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                name="home-faq"
                className="group bg-surface-container-lowest rounded-2xl shadow-sm"
              >
                <summary
                  className={`flex items-center justify-between gap-4 p-5 sm:p-6 list-none [&::-webkit-details-marker]:hidden cursor-pointer rounded-2xl ${focusRing}`}
                >
                  <h3 className="font-headline-sm text-headline-sm text-primary font-bold">{f.q}</h3>
                  <Icon
                    name="expand_more"
                    className="shrink-0 text-on-surface-variant transition-transform duration-200 motion-reduce:transition-none group-open:rotate-180"
                  />
                </summary>
                <p className="px-5 pb-5 sm:px-6 sm:pb-6 font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------- CTA ------------------------------ */}
      <section aria-labelledby="cta-title" className="w-full bg-surface pb-16 sm:pb-24 pt-4">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="bg-primary-container text-on-primary rounded-3xl px-6 py-12 sm:px-10 sm:py-14 lg:p-16 text-center flex flex-col items-center gap-5 shadow-xl">
            <h2
              id="cta-title"
              className="font-headline-xl font-bold tracking-tight text-on-primary max-w-2xl text-[26px] leading-[34px] sm:text-[32px] sm:leading-[40px] lg:text-[38px] lg:leading-[46px]"
            >
              Try HisabLoop with your own team
            </h2>
            <p className="font-body-lg text-body-lg text-surface-variant max-w-xl leading-relaxed">
              We are working with a small group of pilot teams and accountants. Tell us how your team
              handles expenses today and we will help you set up your first claims.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto">
              <Link
                href="/register"
                className={`inline-flex items-center justify-center h-12 px-8 rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg font-bold shadow-md hover:bg-secondary-fixed-dim transition-colors ${focusRing}`}
              >
                Join the pilot
              </Link>
              <Link
                href="/contact"
                className={`inline-flex items-center justify-center h-12 px-8 rounded-lg bg-surface-container-lowest/10 text-on-primary font-label-lg text-label-lg hover:bg-surface-container-lowest/20 transition-colors ${focusRing}`}
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
