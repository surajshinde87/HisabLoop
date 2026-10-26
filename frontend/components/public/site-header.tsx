"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const SOLUTIONS = [
  { href: "/solutions#small-business", label: "Small Businesses" },
  { href: "/solutions#startups", label: "Startups" },
  { href: "/solutions#field-teams", label: "Field Teams" },
  { href: "/solutions#finance-teams", label: "Finance Teams" },
];
const RESOURCES = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact Us" },
];
const linkCls = "font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors py-space-xs";
const activeCls = "text-primary font-bold";
const menuItemCls =
  "px-space-md py-space-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors";

function Dropdown({ label, items, width }: { label: string; items: { href: string; label: string }[]; width: string }) {
  return (
    <div className="group relative">
      <button
        type="button"
        aria-haspopup="true"
        className="flex items-center gap-1 py-space-xs font-label-lg text-label-lg text-on-surface-variant transition-colors group-focus-within:text-on-surface group-hover:text-on-surface"
      >
        <span>{label}</span>
        <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180" aria-hidden>
          expand_more
        </span>
      </button>
      <div className={cn("absolute left-0 top-full z-50 hidden pt-space-xs group-focus-within:block group-hover:block", width)}>
        <div className="flex flex-col gap-1 rounded-xl bg-surface-container-lowest p-space-sm shadow-[0_4px_16px_rgba(11,42,91,0.08),0_1px_2px_rgba(11,42,91,0.04)]">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className={menuItemCls}>
              {i.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Shared public header (from the Stitch export) with a working mobile menu. */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const nav = [
    { href: "/", label: "Product" },
    { href: "/features", label: "Features" },
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-50 w-full bg-surface/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-margin-mobile md:px-margin">
        <Logo />
        <nav className="hidden items-center gap-space-lg lg:flex" aria-label="Main">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={cn(linkCls, pathname === n.href && activeCls)} aria-current={pathname === n.href ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
          <Dropdown label="Solutions" items={SOLUTIONS} width="w-56" />
          <Link href="/accountants" className={cn(linkCls, pathname === "/accountants" && activeCls)}>
            For Accountants
          </Link>
          <Link href="/pricing" className={cn(linkCls, pathname === "/pricing" && activeCls)}>
            Pricing
          </Link>
          <Dropdown label="Resources" items={RESOURCES} width="w-48" />
        </nav>
        <div className="flex items-center gap-space-md">
          <Link href="/login" className="hidden px-space-sm py-space-xs font-label-lg text-label-lg text-on-surface-variant transition-colors hover:text-primary sm:inline-flex">
            Log in
          </Link>
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-space-lg font-label-lg text-label-lg text-on-primary shadow-[0_1px_3px_rgba(11,42,91,0.04),0_4px_12px_rgba(11,42,91,0.03)] transition-all duration-200 hover:bg-primary-container hover:shadow-md"
          >
            Get Started
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex items-center justify-center rounded-lg p-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface lg:hidden"
          >
            <span className="material-symbols-outlined" aria-hidden>
              {open ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>
      {open && (
        <div id="mobile-menu" className="max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-brand-line bg-surface-container-lowest px-margin-mobile pb-6 pt-2 lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {[...nav, { href: "/accountants", label: "For Accountants" }, { href: "/pricing", label: "Pricing" }].map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg px-2 py-3 font-label-lg text-label-lg text-on-surface hover:bg-surface-container-low">
                {n.label}
              </Link>
            ))}
            <p className="mt-3 px-2 font-label-sm text-label-sm uppercase tracking-wider text-outline">Solutions</p>
            {SOLUTIONS.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg px-2 py-2.5 font-body-md text-body-md text-on-surface-variant hover:bg-surface-container-low">
                {n.label}
              </Link>
            ))}
            <p className="mt-3 px-2 font-label-sm text-label-sm uppercase tracking-wider text-outline">Resources</p>
            {RESOURCES.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg px-2 py-2.5 font-body-md text-body-md text-on-surface-variant hover:bg-surface-container-low">
                {n.label}
              </Link>
            ))}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-lg border border-brand-line font-label-lg text-label-lg text-primary">
                Log in
              </Link>
              <Link href="/register" className="inline-flex h-11 items-center justify-center rounded-lg bg-primary font-label-lg text-label-lg text-on-primary">
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
