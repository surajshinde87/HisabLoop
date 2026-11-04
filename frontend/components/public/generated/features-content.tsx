import type { ReactNode } from "react";


const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hisabloop.com";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

const h2Class =
  "font-headline-lg text-primary font-bold tracking-tight text-[24px] leading-[32px] sm:text-[30px] sm:leading-[38px] lg:text-[34px] lg:leading-[42px]";


export const featuresJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/features#webpage`,
      url: `${SITE_URL}/features`,
      name: "HisabLoop features",
      description:
        "WhatsApp bill capture, automatic bill reading, approvals, policy checks, GST reports, reimbursement batches and Excel and CSV exports.",
      inLanguage: "en-IN",
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Features", item: `${SITE_URL}/features` },
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`material-symbols-outlined ${className}`}>
      {name}
    </span>
  );
}

function PlannedTag() {
  return (
    <span className="ml-2 inline-flex items-center rounded-full bg-surface-container px-2 py-0.5 align-middle font-label-sm text-label-sm text-on-surface-variant">
      Planned
    </span>
  );
}

type Point = { text: string; planned?: boolean };

function PointList({ points }: { points: Point[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {points.map((p) => (
        <li key={p.text} className="flex items-start gap-3">
          <Icon name="check_circle" className="text-secondary text-lg mt-0.5 shrink-0" />
          <span className="font-body-md text-body-md text-on-surface min-w-0">
            {p.text}
            {p.planned ? <PlannedTag /> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** A decorative sample of the product UI. Hidden from assistive tech, captioned for everyone. */
function Mock({
  children,
  caption = "Illustration with sample data.",
  decorative = true,
}: {
  children: ReactNode;
  caption?: string;
  decorative?: boolean;
}) {
  return (
    <figure className="min-w-0 w-full max-w-lg mx-auto lg:max-w-none">
      <div
        aria-hidden={decorative ? "true" : undefined}
        className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 shadow-md"
      >
        {children}
      </div>
      <figcaption className="mt-3 text-center font-body-sm text-body-sm text-on-surface-variant">
        {caption}
      </figcaption>
    </figure>
  );
}

function FeatureSection({
  id,
  title,
  intro,
  points,
  visual,
  reverse = false,
  extra,
}: {
  id: string;
  title: string;
  intro: string;
  points: Point[];
  visual: ReactNode;
  reverse?: boolean;
  extra?: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-gutter items-center"
    >
      <div className={`lg:col-span-6 min-w-0 flex flex-col gap-5 ${reverse ? "lg:order-2" : ""}`}>
        <h2 id={`${id}-title`} className={h2Class}>
          {title}
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">{intro}</p>
        <PointList points={points} />
        {extra}
      </div>
      <div className={`lg:col-span-6 min-w-0 ${reverse ? "lg:order-1" : ""}`}>{visual}</div>
    </section>
  );
}

/** Non-interactive button look used inside illustrations. */
function FakeButton({
  children,
  tone = "primary",
  className = "",
}: {
  children: ReactNode;
  tone?: "primary" | "secondary" | "neutral";
  className?: string;
}) {
  const tones = {
    primary: "bg-primary-container text-on-primary",
    secondary: "bg-secondary text-on-secondary",
    neutral: "bg-surface-container text-on-surface-variant",
  } as const;
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 font-label-md text-label-md ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const jumpLinks = [
  { href: "#feature-whatsapp", label: "WhatsApp capture" },
  { href: "#feature-ocr", label: "Bill reading" },
  { href: "#feature-approvals", label: "Approvals" },
  { href: "#feature-policies", label: "Policy checks" },
  { href: "#feature-gst", label: "GST details" },
  { href: "#feature-batches", label: "Reimbursement" },
  { href: "#feature-reports", label: "Exports" },
  { href: "#feature-ca-workspace", label: "CA workspace" },
];

const exportFormats: { name: string; planned: boolean }[] = [
  { name: "Excel (.xlsx)", planned: false },
  { name: "CSV", planned: false },
];

const exportColumns = [
  "Date",
  "Vendor",
  "GSTIN",
  "Category",
  "Taxable value",
  "CGST / SGST / IGST",
  "Total",
  "Employee",
  "Status",
];

const policyCards = [
  {
    icon: "tune",
    title: "Category and role limits",
    text: "Set a limit for each expense category and each role. A claim over the limit is flagged before the manager sees it.",
    example: "Example: meals up to ₹600 per claim for the Sales role.",
  },
  {
    icon: "content_copy",
    title: "Duplicate detection",
    text: "A bill is flagged when the same vendor, amount and date appear again, or when the same image is sent twice.",
    example: "Stops the same bill being claimed twice by one person or across a team.",
  },
  {
    icon: "badge",
    title: "GSTIN checks",
    text: "A missing or badly formatted GSTIN is flagged so the employee can fix it while the bill is still at hand.",
    example: "The check covers the format of the number, not the vendor's registration status.",
  },
];

const capturedFields = [
  "Vendor name and GSTIN",
  "Invoice date",
  "Taxable value",
  "CGST, SGST and IGST split",
  "Total amount and payment mode",
  "Category and original bill image",
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export function FeaturesContent() {
  return (
    <main className="w-full pt-20 bg-background flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(featuresJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* ------------------------------ Hero ------------------------------ */}
      <section aria-labelledby="features-title" className="w-full bg-surface px-margin py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h1
            id="features-title"
            className="font-headline-xl text-primary font-bold tracking-tight max-w-3xl text-[30px] leading-[38px] sm:text-[38px] sm:leading-[46px] lg:text-[46px] lg:leading-[54px]"
          >
            Everything you need to manage expense claims
          </h1>
          <p className="mt-5 font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Bill capture on WhatsApp, approvals, policy checks and clean exports for your accountant.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto">
            <a
              href="/register"
              className={`inline-flex items-center justify-center h-12 px-8 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container transition-colors ${focusRing}`}
            >
              Join the pilot
            </a>
            <a
              href="/contact"
              className={`inline-flex items-center justify-center h-12 px-8 rounded-lg bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm hover:bg-surface-container transition-colors ${focusRing}`}
            >
              Talk to us
            </a>
          </div>

          <p className="mt-6 max-w-2xl font-body-sm text-body-sm text-on-surface-variant">
            Features marked <PlannedTag /> are not available yet.
          </p>

          <nav aria-label="On this page" className="w-full mt-10">
            <ul className="flex flex-nowrap sm:flex-wrap sm:justify-center gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-margin px-margin sm:mx-0 sm:px-0">
              {jumpLinks.map((l) => (
                <li key={l.href} className="shrink-0">
                  <a
                    href={l.href}
                    className={`inline-flex items-center rounded-full bg-surface-container-low px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors whitespace-nowrap ${focusRing}`}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-margin py-12 sm:py-16 flex flex-col gap-16 sm:gap-20 lg:gap-24">
        {/* ---------------------------- Capture --------------------------- */}
        <FeatureSection
          id="feature-whatsapp"
          title="Capture bills on WhatsApp"
          intro="Employees send a photo or PDF of the bill to the HisabLoop number, check the details and tap Yes."
          points={[
            { text: "Accepts photos and PDFs of bills sent on WhatsApp." },
            { text: "Shows the vendor, date, amount and category for the employee to confirm or edit." },
            { text: "No app to install." },
            { text: "No bill? Send a short text such as “Auto fare 180 cash”." },
          ]}
          visual={
            <Mock caption="Illustration with sample data: the bot reads a bill and asks the employee to confirm.">
              <div className="flex items-center gap-3 pb-4">
                <div className="w-10 h-10 rounded-full bg-[#25D366]/20 text-[#128C7E] flex items-center justify-center shrink-0">
                  <Icon name="chat" className="text-xl" />
                </div>
                <span className="font-headline-sm text-headline-sm text-primary font-bold">
                  HisabLoop on WhatsApp
                </span>
              </div>
              <div className="flex flex-col gap-3 bg-surface rounded-xl p-3 sm:p-4">
                <div className="self-end max-w-[85%] rounded-2xl rounded-tr-none bg-[#DCF8C6]/70 p-3">
                  <p className="flex items-center gap-2 font-body-md text-body-md text-on-surface">
                    <Icon name="image" className="text-lg text-secondary" />
                    Photo of an auto fare receipt
                  </p>
                </div>
                <div className="self-start max-w-[92%] rounded-2xl rounded-tl-none bg-surface-container-low p-3.5">
                  <p className="font-headline-sm text-headline-sm text-primary">₹180 · Auto fare · Local travel</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">8 Oct · Paid in cash. Is this correct?</p>
                  <div className="flex gap-2 mt-3">
                    <FakeButton tone="secondary" className="flex-1">Yes</FakeButton>
                    <FakeButton tone="neutral">Edit</FakeButton>
                  </div>
                </div>
              </div>
            </Mock>
          }
        />

        {/* ------------------------------ OCR ----------------------------- */}
        <FeatureSection
          id="feature-ocr"
          reverse
          title="Bills read automatically"
          intro="HisabLoop fills in the details from the bill. The employee checks them before submitting, so mistakes are caught early."
          points={[
            { text: "Reads vendor, date, total, tax amount, GSTIN and payment mode." },
            { text: "Flags a missing or badly formatted GSTIN." },
            { text: "Faded or handwritten bills are harder to read, so the employee can correct any field." },
          ]}
          visual={
            <Mock caption="Illustration with sample data. The employee can edit any field before submitting.">
              <p className="font-headline-sm text-headline-sm text-primary font-bold pb-3">Fields read from the bill</p>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ["Vendor", "Uber"],
                  ["Invoice date", "8 Oct 2026"],
                  ["Taxable value", "₹1,180.95"],
                  ["GST (5%)", "₹59.05"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-surface-container-low rounded-xl p-3 min-w-0">
                    <dt className="font-label-sm text-label-sm text-on-surface-variant">{k}</dt>
                    <dd className="font-body-md text-body-md text-primary font-semibold break-words">{v}</dd>
                  </div>
                ))}
                <div className="sm:col-span-2 bg-surface-container rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <dt className="font-label-sm text-label-sm text-on-surface-variant">Vendor GSTIN</dt>
                    <dd className="font-body-md text-body-md text-primary font-semibold tracking-wide break-all">
                      27ABCDE1234F1Z5
                    </dd>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-lowest px-2.5 py-1 font-label-sm text-label-sm text-secondary">
                    <Icon name="check" className="text-sm" />
                    Format valid
                  </span>
                </div>
              </dl>
              <p className="mt-3 flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3">
                <span className="font-headline-sm text-headline-sm text-primary">Total</span>
                <span className="font-currency-md text-currency-md text-primary font-bold">₹1,240.00</span>
              </p>
            </Mock>
          }
        />

        {/* --------------------------- Approvals -------------------------- */}
        <FeatureSection
          id="feature-approvals"
          title="Approvals with the checks in view"
          intro="Managers see whether a claim is within limits and whether a duplicate was found, then approve, reject or send it back."
          points={[
            { text: "Send a claim back for changes instead of rejecting it." },
            { text: "Claims above a set amount need a second approval." },
            { text: "Every status change is logged with who made it and when." },
            { text: "Hand over approvals to a delegate while a manager is on leave.", planned: true },
          ]}
          visual={
            <Mock caption="Illustration with sample data.">
              <div className="flex items-center justify-between gap-3 pb-3">
                <p className="font-headline-sm text-headline-sm text-primary font-bold">Approval request</p>
                <span className="rounded-full bg-surface-container px-2.5 py-1 font-label-sm text-label-sm text-primary">
                  3 waiting
                </span>
              </div>
              <div className="rounded-xl bg-surface-container-low p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-headline-sm text-headline-sm text-primary">Client dinner</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Meals · 9 Oct</p>
                  </div>
                  <span className="font-currency-md text-currency-md text-primary font-bold shrink-0">₹3,420</span>
                </div>
                <p className="flex items-center gap-2 rounded-lg bg-surface-container-lowest p-3 font-body-sm text-body-sm text-on-surface-variant">
                  <Icon name="check_circle" className="text-secondary text-base" />
                  Within the meals limit · No duplicate found
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <FakeButton tone="secondary">Approve</FakeButton>
                  <FakeButton tone="neutral">Send back</FakeButton>
                  <FakeButton tone="neutral">Reject</FakeButton>
                </div>
              </div>
            </Mock>
          }
        />

        {/* ----------------------------- Policies -------------------------- */}
        <section
          id="feature-policies"
          aria-labelledby="feature-policies-title"
          className="scroll-mt-24 bg-surface-container-low rounded-2xl p-6 sm:p-8 lg:p-10"
        >
          <div className="max-w-2xl mb-8">
            <h2 id="feature-policies-title" className={h2Class}>
              Policy checks before a claim reaches approval
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-3 leading-relaxed">
              Checks run when the employee confirms a bill, so managers only look at what needs a decision.
            </p>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-gutter">
            {policyCards.map((c) => (
              <li key={c.title} className="min-w-0">
                <article className="h-full bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center">
                    <Icon name={c.icon} className="text-xl" />
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-primary font-bold">{c.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{c.text}</p>
                  <p className="mt-auto rounded-lg bg-surface-container-low p-3 font-body-sm text-body-sm text-on-surface-variant">
                    {c.example}
                  </p>
                </article>
              </li>
            ))}
          </ul>
          <p className="mt-6 font-body-sm text-body-sm text-on-surface-variant">
            Flags for suspicious bills, such as an edited image or a future date, are planned
            <PlannedTag />
          </p>
        </section>

        {/* ------------------------------- GST ---------------------------- */}
        <FeatureSection
          id="feature-gst"
          reverse
          title="GST details on every claim"
          intro="HisabLoop keeps the GSTIN and the CGST, SGST and IGST split with every claim, while the employee can still fix a gap."
          points={[
            { text: "Tax fields are stored in separate columns, ready for your accountant." },
            { text: "Missing or invalid GSTINs are flagged on the claim." },
            { text: "Monthly GST report, including ITC you have marked as eligible." },
          ]}
          extra={
            <p className="rounded-xl bg-surface-container-low p-4 font-body-sm text-body-sm text-on-surface-variant">
              <strong className="font-semibold text-primary">Note:</strong> HisabLoop organises tax records.
              It does not file returns or replace your accountant.
            </p>
          }
          visual={
            <Mock caption="What HisabLoop keeps on every claim." decorative={false}>
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold pb-3">Stored with each claim</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {capturedFields.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2.5 font-body-md text-body-md text-on-surface"
                  >
                    <Icon name="check" className="text-secondary text-base shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </Mock>
          }
        />

        {/* ----------------------------- Batches -------------------------- */}
        <FeatureSection
          id="feature-batches"
          title="Reimburse in batches"
          intro="Finance groups approved claims into a batch, pays through the bank and marks it paid. Employees get a Paid message on WhatsApp."
          points={[
            { text: "See the total for each employee before you pay." },
            { text: "Download a bank transfer file in CSV format." },
            { text: "Payment status is recorded on every claim. HisabLoop does not move money." },
            {
              text: "Pay by UPI directly from HisabLoop through a licensed payment partner.",
              planned: true,
            },
          ]}
          visual={
            <Mock caption="Illustration with sample data.">
              <div className="flex items-center justify-between gap-3 pb-3">
                <p className="font-headline-sm text-headline-sm text-primary font-bold">Reimbursement batch</p>
                <span className="rounded-full bg-secondary-fixed/40 px-2.5 py-1 font-label-sm text-label-sm text-on-secondary-fixed">
                  Approved
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {[
                  ["Employee A", "6 claims", "₹14,200"],
                  ["Employee B", "4 claims", "₹9,850"],
                  ["Employee C", "4 claims", "₹8,400"],
                ].map(([n, c, a]) => (
                  <li
                    key={n}
                    className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low px-3 py-2.5 font-body-md text-body-md"
                  >
                    <span className="text-primary font-medium min-w-0">
                      {n} <span className="text-on-surface-variant font-normal">· {c}</span>
                    </span>
                    <span className="text-primary font-semibold shrink-0">{a}</span>
                  </li>
                ))}
              </ul>
              <p className="flex items-center justify-between rounded-xl bg-surface-container px-4 py-3 mt-3">
                <span className="font-headline-sm text-headline-sm text-primary">Batch total</span>
                <span className="font-currency-md text-currency-md text-primary font-bold">₹32,450</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                <FakeButton tone="primary">Download bank file</FakeButton>
                <FakeButton tone="secondary">Mark as paid</FakeButton>
              </div>
            </Mock>
          }
        />

        {/* ----------------------------- Exports -------------------------- */}
        <FeatureSection
          id="feature-reports"
          reverse
          title="Reports and exports"
          intro="See where money goes, and give your accountant one clean file instead of a folder of photos."
          points={[
            { text: "Excel and CSV exports for any month or date range." },
            { text: "Each row traces back to the original bill and its approval history." },
            { text: "Spend reports by category, employee, team and vendor." },
          ]}
          visual={
            <Mock caption="Export formats and the columns in each file." decorative={false}>
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold pb-3">Formats</h3>
              <ul className="flex flex-wrap gap-2">
                {exportFormats.map((f) => (
                  <li
                    key={f.name}
                    className="inline-flex items-center rounded-lg bg-surface-container px-3 py-1.5 font-label-md text-label-md font-semibold text-primary"
                  >
                    {f.name}
                    {f.planned ? <PlannedTag /> : null}
                  </li>
                ))}
              </ul>
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold pt-5 pb-3">Columns</h3>
              <ul className="flex flex-wrap gap-2">
                {exportColumns.map((c) => (
                  <li
                    key={c}
                    className="rounded-full bg-surface-container-low px-3 py-1 font-label-md text-label-md text-on-surface-variant"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </Mock>
          }
        />

        {/* --------------------------- CA workspace ----------------------- */}
        <FeatureSection
          id="feature-ca-workspace"
          title="One login for accountants"
          intro="Accountants switch between client companies, review claims and download exports. Access is read-only and given by each client."
          points={[
            { text: "Switch between client companies without logging out." },
            { text: "Review each client's claims and flags in one place." },
            { text: "Download the same structured exports your clients' finance teams use." },
          ]}
          extra={
            <a
              href="/accountants"
              className={`inline-flex w-fit items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2.5 font-label-md text-label-md text-primary hover:bg-surface-container transition-colors ${focusRing}`}
            >
              Learn about CA partnerships
              <Icon name="arrow_forward" className="text-base" />
            </a>
          }
          visual={
            <Mock caption="Illustration with sample data." decorative={false}>
              <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Sample client list, scrolls sideways on small screens">
                <table className="w-full min-w-[420px] text-left font-body-md text-body-md">
                  <caption className="sr-only">Sample list of client companies</caption>
                  <thead>
                    <tr className="bg-surface-container-low text-primary font-label-md text-label-md">
                      <th scope="col" className="px-3 py-2.5 font-semibold">Client</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Claims waiting</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Last export</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40 text-on-surface">
                    {[
                      ["Client A", "4", "30 Sep 2026"],
                      ["Client B", "11", "30 Sep 2026"],
                      ["Client C", "0", "Not yet exported"],
                    ].map((r) => (
                      <tr key={r[0]}>
                        {r.map((c, i) => (
                          <td key={i} className="px-3 py-3 whitespace-nowrap">
                            {c}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Mock>
          }
        />
      </div>

      {/* ------------------------------- CTA ------------------------------ */}
      <section aria-labelledby="features-cta-title" className="w-full px-margin pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto bg-primary text-on-primary rounded-3xl px-6 py-12 sm:px-10 sm:py-14 lg:p-16 text-center flex flex-col items-center gap-5 shadow-xl">
          <h2
            id="features-cta-title"
            className="font-headline-xl font-bold tracking-tight text-on-primary max-w-2xl text-[26px] leading-[34px] sm:text-[32px] sm:leading-[40px] lg:text-[38px] lg:leading-[46px]"
          >
            Try these features with your own team
          </h2>
          <p className="font-body-lg text-body-lg text-on-primary-container max-w-xl leading-relaxed">
            We are onboarding a small group of pilot teams.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto">
            <a
              href="/register"
              className={`inline-flex items-center justify-center h-12 px-8 rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg font-bold shadow-lg hover:opacity-90 transition-opacity ${focusRing}`}
            >
              Join the pilot
            </a>
            <a
              href="/contact"
              className={`inline-flex items-center justify-center h-12 px-8 rounded-lg bg-surface-container-lowest/10 text-on-primary font-label-lg text-label-lg hover:bg-surface-container-lowest/20 transition-colors ${focusRing}`}
            >
              Talk to us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}