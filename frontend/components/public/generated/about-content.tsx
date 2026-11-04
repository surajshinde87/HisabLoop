const principles = [
  {
    icon: "speed",
    title: "Keep it simple",
    text: "Claiming ₹180 for an auto ride should take seconds, not a form with twenty fields.",
  },
  {
    icon: "account_balance",
    title: "Built for Indian tax",
    text: "GSTIN, CGST, SGST and IGST are part of every claim, not an afterthought.",
  },
  {
    icon: "history_edu",
    title: "Easy to audit",
    text: "Every claim keeps its original bill and a record of who approved it and when.",
  },
  {
    icon: "handshake",
    title: "Work with accountants",
    text: "We don't replace your CA. We give them clean records instead of a folder of photos.",
  },
];

export function AboutContent() {
  return (
    <main className="w-full pt-20 bg-background flex-1">
      <div className="flex flex-col w-full">
        {/* Hero */}
        <div className="relative w-full overflow-hidden bg-surface pb-space-2xl">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[360px] bg-gradient-to-b from-primary-fixed/40 via-secondary-container/20 to-transparent blur-3xl pointer-events-none rounded-full"></div>
          <section className="relative max-w-7xl mx-auto px-margin pt-space-xl sm:pt-space-2xl">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container shadow-sm mb-space-lg">
                <span className="material-symbols-outlined text-secondary text-base">all_inclusive</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                  Expenses in. Clarity out.
                </span>
              </div>
              <h1 className="font-headline-xl text-headline-xl sm:text-[44px] sm:leading-[52px] text-primary font-bold tracking-tight mb-space-md">
                About HisabLoop
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                We are building a simple way for Indian small businesses to collect expense claims, approve them and
                hand clean records to their accountant.
              </p>
            </div>
          </section>
        </div>

        {/* Why */}
        <section className="py-space-2xl bg-surface-container-low">
          <div className="max-w-3xl mx-auto px-margin flex flex-col gap-space-md">
            <h2 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">Why we built it</h2>
            <div className="flex flex-col gap-space-md text-on-surface-variant font-body-md text-body-md leading-relaxed">
              <p>
                In many small businesses, expenses arrive as WhatsApp photos, paper slips and Excel sheets. Managers
                approve over the phone, finance re-types every bill, and the accountant sorts it all out at month end.
              </p>
              <p>
                Most expense tools are built for large companies with corporate cards and long forms. We wanted
                something that works the way Indian teams already work: send the bill on WhatsApp, confirm it, and
                move on.
              </p>
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="py-space-2xl bg-surface">
          <div className="max-w-7xl mx-auto px-margin">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-space-xl">
              <h2 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">What we care about</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {principles.map((p) => (
                <div key={p.title} className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm">
                  <span className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary mb-space-md">
                    <span className="material-symbols-outlined text-2xl">{p.icon}</span>
                  </span>
                  <h3 className="font-headline-md text-headline-md text-primary font-bold mb-space-sm">{p.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Where we are */}
        <section className="py-space-2xl bg-surface-container-low">
          <div className="max-w-3xl mx-auto px-margin flex flex-col gap-space-md">
            <h2 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">Where we are today</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              HisabLoop is in an early pilot. We are working closely with a small number of teams and accountants, and
              shaping the product around their feedback. HisabLoop was founded by Suraj Shinde.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-space-2xl bg-surface">
          <div className="max-w-7xl mx-auto px-margin">
            <div className="relative bg-primary-container text-on-primary rounded-xl p-space-xl sm:p-space-2xl overflow-hidden shadow-xl">
              <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -left-20 -top-20 w-80 h-80 bg-on-tertiary-container/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-space-xl">
                <div className="max-w-2xl text-center lg:text-left">
                  <h2 className="font-headline-xl text-headline-xl text-on-primary font-bold tracking-tight mb-space-sm">
                    Want to try it with your team?
                  </h2>
                  <p className="font-body-lg text-body-lg text-on-primary-container leading-relaxed">
                    Join the pilot, or talk to us about how your team handles expenses today.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row lg:flex-col gap-space-sm w-full sm:w-auto min-w-[240px]">
                  <a
                    className="inline-flex items-center justify-center h-12 px-space-xl rounded-lg bg-secondary hover:bg-secondary-fixed text-on-secondary hover:text-on-secondary-fixed font-label-lg text-label-lg shadow-md transition-all font-semibold gap-2 text-center"
                    href="/register"
                  >
                    <span>Join the pilot</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </a>
                  <a
                    className="inline-flex items-center justify-center h-12 px-space-xl rounded-lg bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-on-primary font-label-lg text-label-lg transition-all text-center"
                    href="/contact"
                  >
                    Talk to us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
