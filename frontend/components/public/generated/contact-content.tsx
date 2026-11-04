import { ContactForm } from "@/components/public/contact-form";

const CONTACT_EMAIL = "help@hisabloop.com";

const nextSteps = [
  { title: "We reply", text: "We get back to you by email or phone to fix a time." },
  { title: "A short demo", text: "We show you how a bill goes from WhatsApp to an approved claim and an export." },
  { title: "Your first claims", text: "If it fits, we help you set up your team for the pilot." },
];

const faqs = [
  {
    q: "What does setup involve?",
    a: "You add your team and set categories and limits. Then employees can start sending bills. We help you through it during the pilot.",
  },
  {
    q: "Can our CA get access?",
    a: "Yes. A company admin invites the accountant by email and they get read-only access.",
  },
  {
    q: "Does HisabLoop connect to Tally or Zoho Books?",
    a: "Not yet. Your accountant gets Excel and CSV files.",
  },
];

export function ContactContent() {
  return (
    <main className="w-full pt-20 bg-background flex-1">
      <div className="flex flex-col w-full">
        {/* Hero */}
        <section className="w-full bg-surface-container-low px-margin py-space-xl">
          <div className="max-w-7xl mx-auto flex flex-col gap-space-sm">
            <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight">Talk to us</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Book a demo, ask a question, or join the CA partner pilot.
            </p>
          </div>
        </section>

        {/* Form and sidebar */}
        <section className="w-full px-margin py-space-2xl">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            <div className="lg:col-span-7 flex flex-col bg-surface-container-lowest rounded-xl p-space-xl shadow-sm">
              <ContactForm variant="demo" />
            </div>

            <div className="lg:col-span-5 flex flex-col gap-space-lg">
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <h2 className="font-headline-sm text-headline-sm text-primary">What happens next</h2>
                <div className="flex flex-col gap-space-sm">
                  {nextSteps.map((s, i) => (
                    <div key={s.title} className="flex gap-space-sm">
                      <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center shrink-0 font-label-sm text-label-sm text-primary">
                        {i + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-primary">{s.title}</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{s.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <h2 className="font-headline-sm text-headline-sm text-primary">Email us</h2>
                <div className="flex items-start gap-space-sm">
                  <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-lg">mail</span>
                  </div>
                  <div className="flex flex-col">
                    <a className="font-body-md text-body-md text-secondary hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
                      {CONTACT_EMAIL}
                    </a>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      For questions, support and privacy requests.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="w-full bg-surface-container-low px-margin py-space-2xl">
          <div className="max-w-5xl mx-auto flex flex-col gap-space-xl">
            <h2 className="font-headline-lg text-headline-lg text-primary text-center">Common questions</h2>
            <div className="flex flex-col gap-space-sm">
              {faqs.map((f) => (
                <div key={f.q} className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
                  <h3 className="font-label-lg text-label-lg text-primary">{f.q}</h3>
                  <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
            <p className="text-center font-body-md text-body-md text-on-surface-variant">
              More answers on the{" "}
              <a className="text-secondary hover:underline" href="/faq">
                FAQ page
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
