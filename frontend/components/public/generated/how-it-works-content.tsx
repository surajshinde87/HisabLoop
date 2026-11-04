import { Reveal, Stagger, StaggerItem } from "@/components/public/motion";

type Step = {
  number: string;
  icon: string;
  label: string;
  title: string;
  text: string;
  points: string[];
};

const steps: Step[] = [
  {
    number: "01",
    icon: "chat",
    label: "Send",
    title: "The employee sends the bill on WhatsApp",
    text: "A photo or PDF of the bill goes to the HisabLoop number. There is no app to install.",
    points: [
      "Works with photos, screenshots and PDF invoices.",
      "No bill for a cash spend? Send a short text such as “Auto fare 180 cash”.",
    ],
  },
  {
    number: "02",
    icon: "fact_check",
    label: "Confirm",
    title: "HisabLoop reads it and the employee confirms",
    text: "HisabLoop fills in the vendor, date, amount, GSTIN and tax split. The employee taps Yes or fixes what is wrong.",
    points: [
      "Nothing is submitted until the employee confirms.",
      "Faded or handwritten bills are harder to read, so every field can be edited.",
    ],
  },
  {
    number: "03",
    icon: "how_to_reg",
    label: "Approve",
    title: "The manager approves, with the checks in view",
    text: "Before a manager sees a claim, HisabLoop checks it against your category limits and looks for duplicates.",
    points: [
      "Approve, reject or send the claim back for changes.",
      "Claims above an amount you set need a second approval.",
      "Every decision is logged with who made it and when.",
    ],
  },
  {
    number: "04",
    icon: "account_balance",
    label: "Pay and export",
    title: "Finance pays in a batch and the accountant gets the records",
    text: "Finance groups approved claims, pays through the bank using the bank file, and marks the batch paid.",
    points: [
      "Employees get a Paid message on WhatsApp.",
      "Your accountant gets Excel or CSV files with GST details in separate columns.",
      "HisabLoop does not move money or connect to accounting software yet.",
    ],
  },
];

const exceptions = [
  {
    icon: "content_copy",
    title: "Duplicate bill",
    text: "If the same bill, or the same file, is sent again, the claim is flagged before approval.",
  },
  {
    icon: "receipt_long",
    title: "Missing or wrong GSTIN",
    text: "A missing or badly formatted GSTIN is flagged, so the employee can fix it while the bill is at hand.",
  },
  {
    icon: "policy",
    title: "Over the limit",
    text: "A claim above the category limit is flagged for the manager to decide.",
  },
  {
    icon: "lens_blur",
    title: "Hard-to-read bill",
    text: "The employee corrects the details before submitting.",
  },
];

export function HowItWorksContent() {
  return (
    <main className="w-full pt-20 bg-background flex-1">
      <div className="flex flex-col w-full">
        <div className="relative overflow-hidden w-full bg-gradient-to-b from-surface via-surface-container-low/60 to-surface pb-space-2xl">
          {/* Hero */}
          <section className="max-w-7xl mx-auto px-margin pt-space-2xl pb-space-xl">
            <Reveal immediate className="flex flex-col items-center text-center max-w-4xl mx-auto">
              <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight mb-space-md">
                From bill to reimbursement in four steps
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed mb-space-xl">
                Employees and managers use WhatsApp. Finance and accountants use the web dashboard.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-space-md mb-space-2xl">
                <a
                  className="btn-lift inline-flex items-center justify-center h-12 px-7 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all duration-200 gap-2"
                  href="/register"
                >
                  <span>Join the pilot</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </a>
                <a
                  className="btn-lift inline-flex items-center justify-center h-12 px-7 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-label-lg text-label-lg shadow-sm transition-all duration-200 gap-2"
                  href="/contact"
                >
                  <span className="material-symbols-outlined text-secondary text-[20px]">calendar_today</span>
                  <span>Book a demo</span>
                </a>
              </div>

              <div className="w-full bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
                  {steps.map((s) => (
                    <a
                      key={s.number}
                      href={`#step-${s.number}`}
                      className="flex flex-col text-left p-space-sm sm:p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-label-sm text-label-sm font-bold text-secondary uppercase tracking-widest">
                          Step {s.number}
                        </span>
                        <span className="material-symbols-outlined text-secondary text-[20px]">{s.icon}</span>
                      </div>
                      <span className="font-headline-sm text-headline-sm text-primary">{s.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          </section>

          {/* Steps */}
          {steps.map((s) => (
            <section
              key={s.number}
              id={`step-${s.number}`}
              className="max-w-3xl mx-auto px-margin py-space-xl scroll-mt-24"
            >
              <Reveal className="flex flex-col gap-space-md">
                <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-secondary/10 text-secondary">
                  <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
                  <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider">
                    Step {s.number} {"·"} {s.label}
                  </span>
                </div>
                <h2 className="font-headline-xl text-headline-xl text-primary leading-tight">{s.title}</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">{s.text}</p>
                <div className="flex flex-col gap-2.5 pt-space-xs">
                  {s.points.map((p) => (
                    <div key={p} className="flex items-start gap-2.5 text-on-surface">
                      <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">check_circle</span>
                      <span className="font-body-md text-body-md">{p}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </section>
          ))}

          {/* Exceptions */}
          <section className="max-w-7xl mx-auto px-margin py-space-2xl">
            <Reveal className="text-center max-w-3xl mx-auto mb-space-xl">
              <h2 className="font-headline-xl text-headline-xl text-primary">When something needs attention</h2>
            </Reveal>
            <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {exceptions.map((e) => (
                <StaggerItem lift key={e.title} className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-surface-container text-secondary flex items-center justify-center mb-space-md">
                    <span className="material-symbols-outlined text-[24px]">{e.icon}</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-2">{e.title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{e.text}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </section>

          {/* CTA */}
          <section className="max-w-7xl mx-auto px-margin py-space-xl">
            <div className="relative rounded-3xl bg-primary text-on-primary overflow-hidden p-space-xl sm:p-space-2xl shadow-xl">
              <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-secondary/20 blur-3xl pointer-events-none"></div>
              <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none"></div>
              <Reveal className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
                <h2 className="font-headline-xl text-headline-xl text-on-primary mb-space-sm leading-tight">
                  See how it fits your team
                </h2>
                <p className="font-body-lg text-body-lg text-on-primary-container max-w-xl mb-space-xl">
                  We are onboarding a small group of pilot teams and will help you set up your first claims.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-space-md w-full">
                  <a
                    className="btn-lift inline-flex items-center justify-center h-12 px-space-xl rounded-lg bg-secondary hover:bg-secondary-fixed text-on-secondary hover:text-on-secondary-fixed font-label-lg text-label-lg shadow-md transition-all duration-200 gap-2"
                    href="/register"
                  >
                    <span>Join the pilot</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </a>
                  <a
                    className="btn-lift inline-flex items-center justify-center h-12 px-space-xl rounded-lg bg-primary-container text-on-primary hover:bg-surface-tint font-label-lg text-label-lg transition-colors gap-2"
                    href="/contact"
                  >
                    <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                    <span>Book a demo</span>
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
