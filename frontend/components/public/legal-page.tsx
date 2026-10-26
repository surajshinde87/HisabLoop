import type { ReactNode } from "react";

/** Layout for legal pages, using the public-page hero pattern from the Stitch designs. */
export function LegalPage({ title, updated, intro, children }: { title: string; updated: string; intro: ReactNode; children: ReactNode }) {
  return (
    <main className="w-full flex-1 bg-background pt-20">
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-surface via-surface-container-low/50 to-surface pb-12 pt-12 lg:pt-16">
        <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[350px] w-[700px] -translate-x-1/2 rounded-full bg-secondary-container/20 blur-3xl" />
        <div className="mx-auto max-w-3xl px-margin-mobile md:px-margin">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1 font-label-sm text-label-sm text-secondary shadow-sm">
            <span className="material-symbols-outlined text-sm" aria-hidden>gavel</span>
            LEGAL
          </div>
          <h1 className="mt-4 font-headline-xl-mobile text-headline-xl-mobile tracking-tight text-primary md:font-headline-xl md:text-headline-xl">{title}</h1>
          <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">Last updated: {updated}</p>
          <div className="mt-6 rounded-xl bg-warning-soft p-4 font-body-sm text-body-sm text-warning-text">
            <strong>Template – requires legal review.</strong> This page is a starting draft written for the HisabLoop product and
            must be reviewed by qualified counsel (including for the Digital Personal Data Protection Act, 2023) before launch.
          </div>
          <p className="mt-6 font-body-lg text-body-lg text-on-surface-variant">{intro}</p>
        </div>
      </section>
      <section className="pb-24">
        <div className="mx-auto max-w-3xl space-y-8 px-margin-mobile md:px-margin [&_h2]:font-headline-md [&_h2]:text-headline-md [&_h2]:text-primary [&_li]:ml-5 [&_li]:list-disc [&_p]:font-body-md [&_p]:text-body-md [&_p]:leading-relaxed [&_p]:text-on-surface-variant [&_ul]:space-y-1.5 [&_ul]:font-body-md [&_ul]:text-body-md [&_ul]:text-on-surface-variant">
          {children}
        </div>
      </section>
    </main>
  );
}
