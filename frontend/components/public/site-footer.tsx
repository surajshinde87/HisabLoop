import Link from "next/link";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/", label: "Overview" },
      { href: "/features", label: "Features" },
      { href: "/accountants", label: "For Accountants" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { href: "/solutions#small-business", label: "Small Businesses" },
      { href: "/solutions#startups", label: "Startups" },
      { href: "/solutions#field-teams", label: "Field Teams" },
      { href: "/solutions#finance-teams", label: "Finance Teams" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/how-it-works", label: "How It Works" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact Us" },
      { href: "/about", label: "About Us" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" }
    ],
  },
];

/** Shared public footer. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto w-full bg-surface-container-low">
      <div className="mx-auto max-w-7xl px-margin-mobile pb-space-xl pt-space-2xl md:px-margin">
        <div className="mb-space-2xl grid grid-cols-1 gap-gutter-sm md:grid-cols-2 lg:grid-cols-6 lg:gap-gutter">
          <div className="flex flex-col gap-space-md lg:col-span-2">
            <div className="flex items-center gap-space-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-container text-secondary shadow-sm">
                <span className="material-symbols-outlined text-xl text-secondary-container" aria-hidden>
                  all_inclusive
                </span>
              </div>
              <span className="font-headline-md text-headline-md tracking-tight text-primary">
                Hisab<span className="text-secondary">Loop</span>
              </span>
            </div>
            <p className="font-label-md text-label-md font-semibold uppercase tracking-wider text-secondary">Expenses in. Clarity out.</p>
            <p className="max-w-sm font-body-md text-body-md leading-relaxed text-on-surface-variant">
              Expense claims for Indian small businesses. Bills on WhatsApp, quick approvals and clean records for your
              accountant.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-space-sm">
              <span className="font-label-lg text-label-lg uppercase tracking-wide text-primary">{col.title}</span>
              <ul className="flex flex-col gap-space-xs">
                {col.links.map((l) => (
                  <li key={l.href} className="list-none">
                    <Link href={l.href} className="font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-space-md rounded-xl bg-surface-container/40 px-space-md py-space-sm pt-space-lg sm:flex-row">
          <p className="font-body-sm text-body-sm text-on-surface-variant">© {year} HisabLoop Technologies All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
