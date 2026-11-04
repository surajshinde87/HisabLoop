import { Reveal, Stagger, StaggerItem } from "@/components/public/motion";
import { PricingEstimator } from "@/components/public/pricing-estimator";

type Plan = {
  name: string;
  price: string;
  blurb: string;
  heading: string;
  items: { text: string; planned?: boolean }[];
  cta: { label: string; href: string };
  highlight?: boolean;
};

const plans: Plan[] = [
  {
    name: "Starter",
    price: "₹99",
    blurb: "For small teams that want bills collected and approved without the chasing.",
    heading: "Includes:",
    items: [
      { text: "Bills on WhatsApp and the web" },
      { text: "Text claims for cash expenses" },
      { text: "Manager approval" },
      { text: "Category limits and duplicate checks" },
      { text: "Excel and CSV exports" },
    ],
    cta: { label: "Join the pilot", href: "/register" },
  },
  {
    name: "Growth",
    price: "₹149",
    blurb: "For teams that need GST reports and tighter approval rules.",
    heading: "Everything in Starter, plus:",
    items: [
      { text: "Second approval for larger amounts" },
      { text: "GST reports" },
      { text: "Spend reports" },
      { text: "Read-only access for your accountant" },
    ],
    cta: { label: "Join the pilot", href: "/register" },
    highlight: true,
  },
  {
    name: "Business",
    price: "₹249",
    blurb: "For teams that want payouts from HisabLoop and priority support.",
    heading: "Everything in Growth, plus:",
    items: [{ text: "UPI payouts", planned: true }, { text: "Priority support" }],
    cta: { label: "Talk to us", href: "/contact" },
  },
];

const faqs = [
  {
    q: "How does per-user pricing work?",
    a: "You pay for each team member who submits or approves claims.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes. Talk to us and we will move you to another plan.",
  },
  {
    q: "Does HisabLoop connect to Tally or Zoho Books?",
    a: "Not yet. On every plan, your accountant gets Excel and CSV files to use in their own records.",
  },
  {
    q: "Are these prices final?",
    a: "No. These are planned prices and may change before public launch. Prices exclude GST.",
  },
];

function Check({ planned }: { planned?: boolean }) {
  return (
    <span
      className={`material-symbols-outlined text-lg shrink-0 mt-0.5 ${planned ? "text-on-surface-variant" : "text-secondary"}`}
    >
      {planned ? "schedule" : "check_circle"}
    </span>
  );
}

export function PricingContent() {
  return (
    <main className="w-full pt-20 bg-background flex-1">
      <div className="flex flex-col w-full">
        <div className="relative w-full overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-secondary/10 via-surface-container/60 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute top-96 -left-40 w-96 h-96 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute top-80 -right-40 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

          {/* Hero */}
          <section className="max-w-7xl mx-auto px-margin pt-space-xl pb-space-lg">
            <Reveal immediate className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight mb-space-md">
                Simple per-user pricing
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                Pay per team member, per month. Prices are in Indian rupees and exclude GST.
              </p>
            </Reveal>
          </section>

          {/* Plans */}
          <section className="max-w-7xl mx-auto px-margin py-space-lg">
            <Stagger className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-stretch">
              {plans.map((p) => (
                <StaggerItem
                  lift
                  key={p.name}
                  className={`relative flex flex-col justify-between bg-surface-container-lowest rounded-xl p-space-xl ${
                    p.highlight
                      ? "shadow-xl shadow-primary/5 -mt-2 lg:-mt-4 mb-2 lg:mb-0"
                      : "shadow-sm hover:shadow-md transition-shadow duration-200"
                  }`}
                >
                  {p.highlight ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="inline-flex items-center px-space-md py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm tracking-wider shadow-md uppercase">
                        Suggested
                      </span>
                    </div>
                  ) : null}
                  <div className={p.highlight ? "pt-space-xs" : undefined}>
                    <span
                      className={`font-label-lg text-label-lg uppercase tracking-wider ${
                        p.highlight ? "text-secondary font-bold" : "text-on-surface-variant"
                      }`}
                    >
                      {p.name}
                    </span>
                    <div className="flex items-baseline gap-1 my-space-sm">
                      <span className="font-currency-display text-currency-display text-primary">{p.price}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">/ user / month</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed pb-space-lg">{p.blurb}</p>
                    <div className="w-full h-px bg-surface-container my-space-md"></div>
                    <div className="flex flex-col gap-space-sm pt-space-xs">
                      <span
                        className={`font-label-sm text-label-sm uppercase tracking-wide ${
                          p.highlight ? "text-secondary font-semibold" : "text-primary"
                        }`}
                      >
                        {p.heading}
                      </span>
                      {p.items.map((it) => (
                        <div key={it.text} className="flex items-start gap-space-sm">
                          <Check planned={it.planned} />
                          <span className="font-body-md text-body-md text-on-surface">
                            {it.text}
                            {it.planned ? (
                              <span className="ml-2 text-on-surface-variant text-label-sm font-semibold">(Planned)</span>
                            ) : null}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-space-xl mt-space-lg">
                    <a
                      className={`btn-lift w-full inline-flex items-center justify-center px-space-lg rounded-lg font-label-lg text-label-lg transition-colors ${
                        p.highlight
                          ? "h-12 bg-primary hover:bg-primary-container text-on-primary shadow-md"
                          : "h-11 bg-surface-container hover:bg-surface-container-high text-primary"
                      }`}
                      href={p.cta.href}
                    >
                      {p.cta.label}
                    </a>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            <div className="mt-space-lg p-space-md rounded-xl bg-surface-container-low flex items-start sm:items-center gap-space-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-secondary text-xl shrink-0">info</span>
              <p className="font-body-sm text-body-sm leading-relaxed">
                <strong>Note:</strong> These are planned prices and may change before public launch. Prices exclude 18% GST.
              </p>
            </div>
          </section>

          {/* Estimator */}
          <section className="max-w-7xl mx-auto px-margin py-space-xl">
            <Reveal className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm">
              <PricingEstimator />
            </Reveal>
          </section>

          {/* FAQ */}
          <section className="max-w-4xl mx-auto px-margin py-space-xl">
            <div className="text-center mb-space-xl">
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Pricing questions</h2>
            </div>
            <Stagger className="flex flex-col gap-space-md">
              {faqs.map((f) => (
                <StaggerItem key={f.q} className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
                  <div className="flex items-start justify-between gap-space-md">
                    <h3 className="font-headline-sm text-headline-sm text-primary">{f.q}</h3>
                    <span className="material-symbols-outlined text-secondary shrink-0">help_outline</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm leading-relaxed">{f.a}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </section>

          {/* CTA */}
          <section className="max-w-7xl mx-auto px-margin py-space-xl">
            <div className="bg-primary-container rounded-xl p-space-xl md:p-space-2xl text-on-primary relative overflow-hidden shadow-xl">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -left-10 -top-10 w-60 h-60 bg-secondary-container/10 rounded-full blur-2xl pointer-events-none"></div>
              <Reveal className="relative z-10 max-w-3xl flex flex-col items-start gap-space-md">
                <h2 className="font-headline-xl text-headline-xl text-on-primary tracking-tight">
                  Try HisabLoop with your team
                </h2>
                <p className="font-body-lg text-body-lg text-on-primary-container leading-relaxed max-w-2xl">
                  We are onboarding a small group of pilot teams and will help you set up your first claims.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md pt-space-md w-full sm:w-auto">
                  <a
                    className="btn-lift inline-flex items-center justify-center h-12 px-space-xl rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-label-lg text-label-lg shadow-md transition-all"
                    href="/register"
                  >
                    Join the pilot
                  </a>
                  <a
                    className="btn-lift inline-flex items-center justify-center h-12 px-space-lg rounded-lg bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-on-primary font-label-lg text-label-lg transition-colors"
                    href="/contact"
                  >
                    <span className="material-symbols-outlined mr-2 text-lg">calendar_month</span>
                    Book a demo
                  </a>
                </div>
              </Reveal>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
