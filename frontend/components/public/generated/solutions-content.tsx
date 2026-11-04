import type { ReactNode } from "react";
import { Reveal, Stagger, StaggerItem } from "@/components/public/motion";


const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hisabloop.com";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

const h2Class =
  "font-headline-lg text-primary font-bold tracking-tight text-[24px] leading-[32px] sm:text-[30px] sm:leading-[38px] lg:text-[34px] lg:leading-[42px]";


type Step = {
  who: string;
  icon: string;
  title: string;
  text: string;
  planned?: boolean;
};

type Point = {
  icon: string;
  title: string;
  text: string;
  planned?: boolean;
};

type Solution = {
  id: string;
  navLabel: string;
  navIcon: string;
  title: string;
  intro: string;
  bestFor: string;
  steps: Step[];
  points: Point[];
  note?: string;
  link: { href: string; label: string };
  tone: string;
};

/** The one flow every team shares. */
const commonFlow: Step[] = [
  {
    who: "Employee",
    icon: "photo_camera",
    title: "Sends the bill",
    text: "A photo or PDF of the bill goes to the HisabLoop WhatsApp number.",
  },
  {
    who: "HisabLoop",
    icon: "document_scanner",
    title: "Reads the bill",
    text: "It picks out the vendor, date, amount, tax and GSTIN.",
  },
  {
    who: "Employee",
    icon: "fact_check",
    title: "Confirms the details",
    text: "The employee taps Yes, or Edit to fix anything that is wrong.",
  },
  {
    who: "Manager",
    icon: "how_to_reg",
    title: "Approves in chat",
    text: "Approve, reject or send back, with limit and duplicate checks shown.",
  },
  {
    who: "Finance",
    icon: "payments",
    title: "Pays and exports",
    text: "Approved claims are paid in a batch. The accountant gets an Excel or CSV file.",
  },
];

const solutions: Solution[] = [
  {
    id: "small-business",
    navLabel: "Small businesses",
    navIcon: "storefront",
    title: "For small businesses",
    intro:
      "Bills reach you as paper slips and WhatsApp photos, and someone types them into Excel at month end. HisabLoop captures the details when the bill is sent.",
    bestFor: "Owners and office managers of teams of about 5 to 50 people.",
    steps: [
      {
        who: "Employee",
        icon: "chat",
        title: "Sends the bill on WhatsApp",
        text: "No app to install and no password to remember.",
      },
      {
        who: "HisabLoop",
        icon: "document_scanner",
        title: "Reads it and asks to confirm",
        text: "The employee checks the amount and category in the chat.",
      },
      {
        who: "Owner",
        icon: "thumb_up",
        title: "Approves in one tap",
        text: "Claims over your limit are flagged first.",
      },
      {
        who: "Accountant",
        icon: "table_view",
        title: "Gets one clean file",
        text: "Excel or CSV, instead of a folder of photos.",
      },
    ],
    points: [
      {
        icon: "mark_chat_unread",
        title: "Nothing new to learn",
        text: "Your team keeps using WhatsApp. Sending a bill takes about as long as sending a photo.",
      },
      {
        icon: "tune",
        title: "Limits you choose",
        text: "Set a limit for each category, like travel or meals. Claims above it are flagged.",
      },
      {
        icon: "receipt_long",
        title: "Ready for your CA",
        text: "Vendor, GSTIN and tax sit in separate columns, so your accountant does not re-type anything.",
      },
    ],
    link: { href: "/features", label: "See all features" },
    tone: "bg-surface-container-low",
  },
  {
    id: "startups",
    navLabel: "Startups",
    navIcon: "rocket_launch",
    title: "For startups",
    intro:
      "Quick approvals and a clear view of spend, without heavy finance software.",
    bestFor: "Founders and finance leads of teams of about 5 to 50 people.",
    steps: [
      {
        who: "Employee",
        icon: "chat",
        title: "Sends the bill",
        text: "Confirms the details in the same chat.",
      },
      {
        who: "HisabLoop",
        icon: "rule",
        title: "Checks the rules",
        text: "Looks at the category limit, duplicates and missing GST details.",
      },
      {
        who: "Manager",
        icon: "how_to_reg",
        title: "Approves in chat",
        text: "Sees the checks before deciding.",
      },
      {
        who: "Admin",
        icon: "account_tree",
        title: "Second approval for big amounts",
        text: "Claims above an amount you set need a second approval.",
      },
      {
        who: "Finance",
        icon: "payments",
        title: "Pays in a batch",
        text: "Approved claims are grouped and paid together.",
      },
    ],
    points: [
      {
        icon: "bolt",
        title: "Fast approvals",
        text: "Managers approve from WhatsApp. They do not need to open another tool.",
      },
      {
        icon: "groups",
        title: "Rules by role and category",
        text: "Give different roles different limits for the same category.",
      },
      {
        icon: "bar_chart",
        title: "Spend reports",
        text: "See spend by category, employee, team and vendor.",
      },
    ],
    link: { href: "/pricing", label: "See planned pricing" },
    tone: "bg-background",
  },
  {
    id: "field-teams",
    navLabel: "Field teams",
    navIcon: "local_shipping",
    title: "For field and sales teams",
    intro:
      "Sales reps, drivers and site supervisors photograph the bill, send it on WhatsApp and get back to work.",
    bestFor: "Anyone who pays for fuel, tolls, food or stays while travelling for work.",
    steps: [
      {
        who: "Employee",
        icon: "photo_camera",
        title: "Photographs the bill",
        text: "Fuel slip, toll receipt, food bill or hotel invoice.",
      },
      {
        who: "Employee",
        icon: "chat",
        title: "Sends it on WhatsApp",
        text: "To the HisabLoop number, from the phone they already carry.",
      },
      {
        who: "HisabLoop",
        icon: "fact_check",
        title: "Shows what it read",
        text: "The employee taps Yes, or Edit to correct it.",
      },
      {
        who: "Manager",
        icon: "how_to_reg",
        title: "Approves",
        text: "From WhatsApp, wherever the manager is.",
      },
      {
        who: "Employee",
        icon: "notifications_active",
        title: "Gets a Paid message",
        text: "No need to ask finance whether the money was sent.",
      },
    ],
    points: [
      {
        icon: "edit_note",
        title: "Fix mistakes on the spot",
        text: "You check the details before the claim goes to your manager.",
      },
      {
        icon: "visibility",
        title: "Know where your claim is",
        text: "See when it was approved and when it was paid.",
      },
      {
        icon: "keyboard_voice",
        title: "Claims by text",
        text: "No bill for a cash spend? Send a short text such as “Auto fare 180 cash”.",
      },
    ],
    link: { href: "/how-it-works", label: "See how it works" },
    tone: "bg-surface-container-low",
  },
  {
    id: "finance-teams",
    navLabel: "Finance teams and CAs",
    navIcon: "account_balance",
    title: "For finance teams and accountants",
    intro:
      "Each bill, its details and its approval history stay together, so records are complete and easy to check.",
    bestFor: "Finance staff, business owners who handle accounts, and CAs with several clients.",
    steps: [
      {
        who: "HisabLoop",
        icon: "inventory_2",
        title: "Collects approved claims",
        text: "Each one keeps its bill image, details and approvals.",
      },
      {
        who: "Finance",
        icon: "fact_check",
        title: "Reviews the batch",
        text: "Sees the total for each employee before paying.",
      },
      {
        who: "Finance",
        icon: "download",
        title: "Downloads the bank file",
        text: "A CSV file to upload to your bank.",
      },
      {
        who: "Finance",
        icon: "task_alt",
        title: "Marks the batch paid",
        text: "Each employee gets a Paid message on WhatsApp.",
      },
      {
        who: "Accountant",
        icon: "table_view",
        title: "Exports for the books",
        text: "Excel or CSV for any month or date range.",
      },
    ],
    points: [
      {
        icon: "history_edu",
        title: "A record for every claim",
        text: "The original bill, the details read from it, any edits and who approved it.",
      },
      {
        icon: "badge",
        title: "GST details kept apart",
        text: "GSTIN and the CGST, SGST and IGST split are stored in their own fields.",
      },
      {
        icon: "assessment",
        title: "GST report",
        text: "Monthly CGST, SGST and IGST totals, and ITC you have marked as eligible.",
      },
      {
        icon: "currency_rupee",
        title: "UPI payouts",
        text: "Pay approved claims by UPI through a licensed payment partner.",
        planned: true,
      },
    ],
    note: "HisabLoop organises tax records. Your accountant still handles GST filing.",
    link: { href: "/accountants", label: "For accountants" },
    tone: "bg-background",
  },
];

const glossary = [
  {
    term: "GSTIN",
    meaning: "The GST registration number printed on a business's bill.",
  },
  {
    term: "ITC (input tax credit)",
    meaning:
      "GST paid on business purchases that a business can often claim back. Your accountant decides what is eligible.",
  },
  {
    term: "Batch",
    meaning: "A group of approved claims that finance pays together.",
  },
  {
    term: "Planned",
    meaning: "Not available yet.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Structured data                                                           */
/* -------------------------------------------------------------------------- */

export const solutionsJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/solutions#webpage`,
      url: `${SITE_URL}/solutions`,
      name: "HisabLoop solutions",
      description:
        "How small businesses, startups, field teams and finance teams use HisabLoop to send bills on WhatsApp, get approvals and export clean records.",
      inLanguage: "en-IN",
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Solutions", item: `${SITE_URL}/solutions` },
      ],
    },
    {
      "@type": "ItemList",
      name: "HisabLoop solutions by team",
      itemListElement: solutions.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: s.navLabel,
        url: `${SITE_URL}/solutions#${s.id}`,
      })),
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Building blocks                                                           */
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

/**
 * A step-by-step flow. Stacks top to bottom on phones and tablets,
 * runs left to right from large screens. Real text, so it is readable
 * by search engines and screen readers.
 */
function Flow({ steps, label }: { steps: Step[]; label: string }) {
  return (
    <Stagger as="ol" aria-label={label} className="flex flex-col lg:flex-row lg:items-stretch gap-0">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <StaggerItem as="li" key={s.title} className="flex flex-col lg:flex-row lg:flex-1 items-stretch min-w-0">
            <div
              className={`flex-1 min-w-0 rounded-xl bg-surface-container-lowest p-4 shadow-sm flex flex-col gap-2 ${s.planned ? "border border-dashed border-outline" : ""
                }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-surface-container text-primary flex items-center justify-center">
                  <Icon name={s.icon} className="text-xl" />
                </div>
                <span className="rounded-full bg-surface-container-low px-2.5 py-0.5 font-label-sm text-label-sm text-on-surface-variant">
                  {s.who}
                </span>
              </div>
              <p className="font-headline-sm text-headline-sm text-primary font-bold">
                <span className="sr-only">Step {i + 1}: </span>
                {s.title}
                {s.planned ? <PlannedTag /> : null}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{s.text}</p>
            </div>
            {!last ? (
              <div
                aria-hidden="true"
                className="flex items-center justify-center text-outline py-1 lg:py-0 lg:px-1.5 shrink-0"
              >
                <Icon name="arrow_downward" className="lg:hidden" />
                <Icon name="arrow_forward" className="hidden lg:block" />
              </div>
            ) : null}
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}

function Wrapper({ children }: { children: ReactNode }) {
  return <div className="max-w-7xl mx-auto px-margin">{children}</div>;
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export function SolutionsContent() {
  return (
    <main className="w-full pt-20 bg-background flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(solutionsJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* ------------------------------ Hero ------------------------------ */}
      <section aria-labelledby="solutions-title" className="w-full bg-surface py-12 sm:py-16 lg:py-20">
        <Wrapper>
          <Reveal immediate className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <h1
              id="solutions-title"
              className="font-headline-xl text-primary font-bold tracking-tight text-[30px] leading-[38px] sm:text-[38px] sm:leading-[46px] lg:text-[46px] lg:leading-[54px]"
            >
              HisabLoop for your team
            </h1>
            <p className="mt-5 font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Pick the team most like yours.
            </p>

            <nav aria-label="Choose your team" className="mt-8 w-full">
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-center gap-3">
                {solutions.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`flex items-center justify-center gap-2 rounded-full bg-surface-container-lowest px-5 py-3 font-label-md text-label-md text-on-surface shadow-sm hover:bg-surface-container transition-colors ${focusRing}`}
                    >
                      <Icon name={s.navIcon} className="text-secondary text-lg" />
                      {s.navLabel}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto">
              <a
                href="/register"
                className={`btn-lift inline-flex items-center justify-center h-12 px-8 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container transition-colors ${focusRing}`}
              >
                Join the pilot
              </a>
              <a
                href="/contact"
                className={`btn-lift inline-flex items-center justify-center h-12 px-8 rounded-lg bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm hover:bg-surface-container transition-colors ${focusRing}`}
              >
                Talk to us
              </a>
            </div>
          </Reveal>
        </Wrapper>
      </section>

      {/* ---------------------------- Common flow ------------------------- */}
      <section
        aria-labelledby="common-flow-title"
        className="w-full bg-surface-container-low py-12 sm:py-16 lg:py-20"
      >
        <Wrapper>
          <Reveal as="header" className="max-w-3xl mb-8 sm:mb-10">
            <h2 id="common-flow-title" className={h2Class}>
              How it works for every team
            </h2>
            <p className="mt-3 font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Employees and managers use WhatsApp. Finance and accountants use the web dashboard.
            </p>
          </Reveal>
          <Flow steps={commonFlow} label="How a bill becomes a paid claim" />
        </Wrapper>
      </section>

      {/* --------------------------- Team sections ------------------------ */}
      {solutions.map((s) => (
        <section
          key={s.id}
          id={s.id}
          aria-labelledby={`${s.id}-title`}
          className={`w-full ${s.tone} py-14 sm:py-20 lg:py-24 scroll-mt-24`}
        >
          <Wrapper>
            <Reveal as="header" className="max-w-3xl">
              <h2 id={`${s.id}-title`} className={h2Class}>
                {s.title}
              </h2>
              <p className="mt-4 font-body-lg text-body-lg text-on-surface-variant leading-relaxed">{s.intro}</p>
              <p className="mt-3 font-body-md text-body-md text-on-surface">
                <strong className="font-semibold text-primary">Best for: </strong>
                {s.bestFor}
              </p>
            </Reveal>

            <h3 className="mt-10 mb-4 font-headline-md text-headline-md text-primary font-bold">
              How it works for this team
            </h3>
            <Flow steps={s.steps} label={`How it works: ${s.navLabel}`} />

            <h3 className="mt-10 mb-4 font-headline-md text-headline-md text-primary font-bold">
              What helps
            </h3>
            <Stagger as="ul" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {s.points.map((p) => (
                <StaggerItem as="li" lift
                  key={p.title}
                  className="min-w-0 rounded-xl bg-surface-container-lowest p-5 shadow-sm flex items-start gap-4"
                >
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-surface-container text-secondary flex items-center justify-center">
                    <Icon name={p.icon} className="text-xl" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-headline-sm text-headline-sm text-primary font-bold">
                      {p.title}
                      {p.planned ? <PlannedTag /> : null}
                    </h4>
                    <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      {p.text}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            {s.note ? (
              <p className="mt-6 max-w-3xl rounded-xl bg-surface-container-lowest p-4 font-body-sm text-body-sm text-on-surface-variant">
                {s.note}
              </p>
            ) : null}

            <a
              href={s.link.href}
              className={`mt-8 inline-flex items-center gap-1.5 font-label-lg text-label-lg text-secondary hover:text-primary transition-colors ${focusRing}`}
            >
              {s.link.label}
              <Icon name="arrow_forward" className="text-base" />
            </a>
          </Wrapper>
        </section>
      ))}

      {/* ------------------------------ Glossary -------------------------- */}
      <section aria-labelledby="glossary-title" className="w-full bg-background py-14 sm:py-20">
        <Wrapper>
          <h2 id="glossary-title" className={`${h2Class} mb-8`}>
            Words used on this page
          </h2>
          <Stagger as="dl" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {glossary.map((g) => (
              <StaggerItem key={g.term} className="rounded-xl bg-surface-container-low p-5 min-w-0">
                <dt className="font-headline-sm text-headline-sm text-primary font-bold">{g.term}</dt>
                <dd className="mt-1 font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {g.meaning}
                </dd>
              </StaggerItem>
            ))}
          </Stagger>
        </Wrapper>
      </section>

      {/* -------------------------------- CTA ----------------------------- */}
      <section aria-labelledby="solutions-cta-title" className="w-full bg-background pb-16 sm:pb-24">
        <Wrapper>
          <Reveal className="bg-primary-container text-on-primary rounded-3xl px-6 py-12 sm:px-10 sm:py-14 lg:p-16 text-center flex flex-col items-center gap-5 shadow-xl">
            <h2
              id="solutions-cta-title"
              className="font-headline-xl font-bold tracking-tight text-on-primary max-w-2xl text-[26px] leading-[34px] sm:text-[32px] sm:leading-[40px] lg:text-[38px] lg:leading-[46px]"
            >
              Not sure which fits your team?
            </h2>
            <p className="font-body-lg text-body-lg text-on-primary-container max-w-xl leading-relaxed">
              Tell us how your team handles expenses today and we will show you how HisabLoop fits.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto">
              <a
                href="/register"
                className={`btn-lift inline-flex items-center justify-center h-12 px-8 rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg font-bold shadow-md hover:opacity-90 transition-opacity ${focusRing}`}
              >
                Join the pilot
              </a>
              <a
                href="/contact"
                className={`btn-lift inline-flex items-center justify-center h-12 px-8 rounded-lg bg-surface-container-lowest/10 text-on-primary font-label-lg text-label-lg hover:bg-surface-container-lowest/20 transition-colors ${focusRing}`}
              >
                Talk to us
              </a>
            </div>
          </Reveal>
        </Wrapper>
      </section>
    </main>
  );
}