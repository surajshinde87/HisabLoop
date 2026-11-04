import { FaqSearchInput, FaqFilterPill } from "@/components/public/faq-search";

type Section = { id: string; icon: string; title: string; items: { q: string; a: string }[] };

const sections: Section[] = [
  {
    id: "section-claims",
    icon: "chat",
    title: "Sending bills",
    items: [
      {
        q: "Do employees need to install an app?",
        a: "No. Employees send a photo or PDF of the bill to the HisabLoop WhatsApp number. Claims can also be added from the web.",
      },
      {
        q: "What if there is no bill?",
        a: "Employees can send a short text such as “Auto fare 180 cash”. HisabLoop suggests the details and the employee confirms them.",
      },
      {
        q: "What if a bill is read wrongly?",
        a: "The employee sees the details before submitting and can correct any field. Faded or handwritten bills are the hardest to read.",
      },
    ],
  },
  {
    id: "section-approvals",
    icon: "tune",
    title: "Approvals and checks",
    items: [
      {
        q: "How do approvals work?",
        a: "The employee's manager, or a company admin, approves, rejects or sends the claim back for changes. Nobody can approve their own claim.",
      },
      {
        q: "Can large claims need a second approval?",
        a: "Yes. Claims above an amount you set need a second approval from an admin.",
      },
      {
        q: "What does HisabLoop check before approval?",
        a: "Category limits, which can differ by role, duplicate bills, missing receipts, and missing or badly formatted GSTINs.",
      },
    ],
  },
  {
    id: "section-gst",
    icon: "verified_user",
    title: "GST and accountants",
    items: [
      {
        q: "Does HisabLoop handle GST?",
        a: "It records the GSTIN and the CGST, SGST and IGST split on each claim, and gives you monthly GST reports. Your accountant still handles filing.",
      },
      {
        q: "Does HisabLoop verify GSTINs with the GST portal?",
        a: "No. It checks the format of the GSTIN only, not whether the business is registered.",
      },
      {
        q: "How does my accountant get access?",
        a: "A company admin invites the accountant by email. Accountants get read-only access and can switch between their client companies.",
      },
    ],
  },
  {
    id: "section-payments",
    icon: "account_balance",
    title: "Payments and exports",
    items: [
      {
        q: "How are employees paid back?",
        a: "Finance groups approved claims into a batch, pays through the bank using the bank file, and marks the batch paid. Employees get a Paid message. HisabLoop does not move money.",
      },
      {
        q: "Does it connect to Tally or Zoho Books?",
        a: "Not yet. You can export claims, GST and spend reports as Excel or CSV files.",
      },
      {
        q: "Can I pay by UPI from HisabLoop?",
        a: "Not yet. UPI payouts are planned.",
      },
    ],
  },
  {
    id: "section-account",
    icon: "security",
    title: "Account and data",
    items: [
      {
        q: "Who can see my company's data?",
        a: "Only people your company has given access to, based on their role. Each company's data is kept separate.",
      },
      {
        q: "How much does it cost?",
        a: "Planned prices start at ₹99 per user per month. See the pricing page for details.",
      },
      {
        q: "How do I get started?",
        a: "Join the pilot or contact us. We will help you set up your team.",
      },
    ],
  },
];

const pills = [
  { term: "WhatsApp", label: "WhatsApp" },
  { term: "GST", label: "GST" },
  { term: "approv", label: "Approvals" },
  { term: "Excel", label: "Exports" },
  { term: "accountant", label: "Accountants" },
];

export function FaqContent() {
  return (
    <main className="w-full pt-20 bg-background flex-1">
      <div className="flex flex-col w-full">
        {/* Hero and search */}
        <section className="relative overflow-hidden bg-gradient-to-b from-surface via-surface-container-low to-background pt-8 pb-16 lg:pb-24">
          <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-secondary-fixed-dim/20 blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/4 -right-24 w-96 h-96 rounded-full bg-primary-fixed-dim/25 blur-3xl pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-margin">
            <div className="max-w-3xl mb-10 pt-8">
              <h1 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight mb-4">
                Frequently asked questions
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                Quick answers about sending bills, approvals, GST and payments.
              </p>
            </div>

            <div className="max-w-4xl relative mb-6">
              <div className="relative flex items-center bg-surface-container-lowest rounded-2xl shadow-xl transition-all duration-200">
                <div className="pl-5 pr-2 text-on-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-secondary">search</span>
                </div>
                <FaqSearchInput />
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-4 px-1">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold mr-1">
                  Topics:
                </span>
                {pills.map((p) => (
                  <FaqFilterPill
                    key={p.term}
                    term={p.term}
                    className="filter-pill px-3 py-1 rounded-full bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container text-on-surface-variant font-label-sm text-label-sm transition-all"
                  >
                    {p.label}
                  </FaqFilterPill>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Questions */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="max-w-4xl mx-auto px-margin">
            {sections.map((s) => (
              <div key={s.id} className="mb-16 last:mb-0 scroll-mt-28" id={s.id}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-secondary-container/40 flex items-center justify-center text-on-secondary-container">
                    <span className="material-symbols-outlined text-xl">{s.icon}</span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-primary font-bold">{s.title}</h2>
                </div>
                <div className="flex flex-col gap-4">
                  {s.items.map((f) => (
                    <details
                      key={f.q}
                      className="group rounded-2xl bg-surface-container-lowest shadow-sm open:shadow-md transition-all duration-200"
                      data-faq-item=""
                    >
                      <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                        <span className="font-headline-sm text-headline-sm text-primary font-semibold pr-4">{f.q}</span>
                        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-open:rotate-180 transition-transform">
                          <span className="material-symbols-outlined text-lg">expand_more</span>
                        </div>
                      </summary>
                      <div className="px-6 pb-6 pt-2 font-body-md text-body-md text-on-surface-variant leading-relaxed">
                        <p>{f.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 lg:py-24 bg-primary text-on-primary relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-secondary/15 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-primary-container/80 blur-3xl pointer-events-none"></div>
          <div className="max-w-4xl mx-auto px-margin text-center relative z-10">
            <h2 className="font-headline-xl text-headline-xl font-bold tracking-tight mb-4">Still have a question?</h2>
            <p className="font-body-lg text-body-lg text-on-primary-container max-w-2xl mx-auto mb-8 leading-relaxed">
              Write to us and we will get back to you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded-xl bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container font-label-lg text-label-lg transition-all shadow-lg hover:shadow-xl"
                href="/contact"
              >
                Contact us
              </a>
              <a
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded-xl bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-on-primary font-label-lg text-label-lg transition-all"
                href="/register"
              >
                Join the pilot
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
