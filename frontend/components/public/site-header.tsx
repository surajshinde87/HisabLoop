"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

interface DropdownItem {
  href: string;
  label: string;
  desc?: string;
  icon?: string;
}

const SOLUTIONS: DropdownItem[] = [
  {
    href: "/solutions#small-business",
    label: "Small Businesses",
    desc: "For teams of 5–50 with active field expenses",
    icon: "storefront",
  },
  {
    href: "/solutions#startups",
    label: "Startups",
    desc: "Fast approval chains and real-time category limits",
    icon: "rocket_launch",
  },
  {
    href: "/solutions#field-teams",
    label: "Field Teams",
    desc: "Snap receipts in WhatsApp with zero app install",
    icon: "commute",
  },
  {
    href: "/solutions#finance-teams",
    label: "Finance Teams",
    desc: "Automated OCR, GST checks and bank payout files",
    icon: "account_balance",
  },
];

const RESOURCES: DropdownItem[] = [
  {
    href: "/how-it-works",
    label: "How It Works",
    desc: "Step-by-step from bill snap to payout & export",
    icon: "route",
  },
  {
    href: "/faq",
    label: "FAQ",
    desc: "Answers on GST, OCR accuracy, limits and security",
    icon: "help",
  },
  {
    href: "/contact",
    label: "Contact Us",
    desc: "Talk with our onboarding and pilot support team",
    icon: "support_agent",
  },
];

const NAV_LINKS = [
  { href: "/", label: "Product" },
  { href: "/features", label: "Features" },
];

function DesktopDropdown({
  label,
  items,
  active,
  width = "w-80",
}: {
  label: string;
  items: DropdownItem[];
  active?: boolean;
  width?: string;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        aria-haspopup="true"
        className={cn(
          "flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-label-md xl:font-label-lg text-label-md xl:text-label-lg text-on-surface-variant transition-all duration-200 hover:bg-surface-container/60 hover:text-primary group-hover:bg-surface-container/60 group-hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
          active && "font-bold text-primary"
        )}
      >
        <span>{label}</span>
        <span
          className="material-symbols-outlined text-[18px] text-on-surface-variant/80 transition-transform duration-200 ease-out group-hover:rotate-180 group-focus-within:rotate-180 group-hover:text-primary"
          aria-hidden
        >
          expand_more
        </span>
      </button>

      {/* Invisible hover bridge and animated popover */}
      <div
        className={cn(
          "absolute left-0 top-full z-50 pt-2 transition-all duration-200 ease-out transform",
          "opacity-0 translate-y-2 pointer-events-none scale-95",
          "group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-hover:scale-100",
          "group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto group-focus-within:scale-100",
          width
        )}
      >
        <div className="flex flex-col gap-1 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/95 p-2 shadow-[0_12px_36px_rgba(11,42,91,0.08),0_2px_8px_rgba(11,42,91,0.04)] backdrop-blur-2xl">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="group/item flex items-start gap-3 rounded-xl p-2.5 transition-all duration-150 hover:bg-surface-container hover:translate-x-0.5"
            >
              {i.icon && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-low text-secondary transition-colors group-hover/item:bg-secondary-container/50 group-hover/item:text-on-secondary-container">
                  <span className="material-symbols-outlined text-[19px]" aria-hidden>
                    {i.icon}
                  </span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-primary transition-colors group-hover/item:text-secondary">
                  {i.label}
                </span>
                {i.desc && (
                  <span className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant leading-snug">
                    {i.desc}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileSubmenu({
  label,
  items,
  active,
  onNavigate,
}: {
  label: string;
  items: DropdownItem[];
  active?: boolean;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden transition-colors">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left font-label-lg text-label-lg text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
          active && "font-bold text-primary",
          expanded && "bg-surface-container-low/60"
        )}
      >
        <span>{label}</span>
        <span
          className={cn(
            "material-symbols-outlined text-[20px] text-on-surface-variant transition-transform duration-200 ease-out",
            expanded && "rotate-180 text-primary"
          )}
          aria-hidden
        >
          expand_more
        </span>
      </button>

      {/* Smooth height transition using CSS Grid rows */}
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out pl-2",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden flex flex-col space-y-1 pt-1 pb-1">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              {i.icon && (
                <span className="material-symbols-outlined text-[18px] text-secondary shrink-0" aria-hidden>
                  {i.icon}
                </span>
              )}
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-medium text-on-surface">{i.label}</span>
                {i.desc && (
                  <span className="text-[12px] text-outline leading-tight line-clamp-1">{i.desc}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Shared public header with responsive layout and smooth animations. */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Listen to scroll position for elevation
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isSolutionsActive = pathname.startsWith("/solutions");
  const isResourcesActive =
    pathname === "/how-it-works" || pathname === "/faq" || pathname === "/contact";

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-50 w-full transition-all duration-300 ease-out",
          scrolled || open
            ? "border-b border-outline-variant/30 bg-surface/95 shadow-[0_4px_24px_rgba(11,42,91,0.06)] backdrop-blur-xl"
            : "border-b border-transparent bg-surface/80 backdrop-blur-md shadow-none"
        )}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo className="shrink-0 transition-transform duration-200 hover:scale-[1.01]" />

          {/* Desktop Navigation (visible >= lg: 1024px) */}
          <nav className="hidden items-center gap-1 lg:gap-2 xl:gap-3 lg:flex" aria-label="Main">
            {NAV_LINKS.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 font-label-md xl:font-label-lg text-label-md xl:text-label-lg text-on-surface-variant transition-all duration-200 hover:bg-surface-container/60 hover:text-primary",
                    active && "font-bold text-primary bg-surface-container/70"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {n.label}
                </Link>
              );
            })}

            <DesktopDropdown
              label="Solutions"
              items={SOLUTIONS}
              active={isSolutionsActive}
              width="w-80"
            />

            <Link
              href="/accountants"
              className={cn(
                "rounded-lg px-2.5 py-1.5 font-label-md xl:font-label-lg text-label-md xl:text-label-lg text-on-surface-variant transition-all duration-200 hover:bg-surface-container/60 hover:text-primary",
                pathname === "/accountants" && "font-bold text-primary bg-surface-container/70"
              )}
              aria-current={pathname === "/accountants" ? "page" : undefined}
            >
              For Accountants
            </Link>

            <Link
              href="/pricing"
              className={cn(
                "rounded-lg px-2.5 py-1.5 font-label-md xl:font-label-lg text-label-md xl:text-label-lg text-on-surface-variant transition-all duration-200 hover:bg-surface-container/60 hover:text-primary",
                pathname === "/pricing" && "font-bold text-primary bg-surface-container/70"
              )}
              aria-current={pathname === "/pricing" ? "page" : undefined}
            >
              Pricing
            </Link>

            <DesktopDropdown
              label="Resources"
              items={RESOURCES}
              active={isResourcesActive}
              width="w-72"
            />
          </nav>

          {/* Action CTAs & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center h-10 px-3.5 xl:px-4 rounded-lg font-label-md xl:font-label-lg text-label-md xl:text-label-lg text-on-surface-variant transition-all duration-200 hover:text-primary hover:bg-surface-container/60"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 sm:px-5 font-label-md xl:font-label-lg text-label-md xl:text-label-lg text-on-primary shadow-sm hover:shadow-md hover:bg-primary-container transition-all duration-200 active:scale-[0.98]"
            >
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
            </Link>

            {/* Smooth animated hamburger toggle button */}
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <div className="flex h-3.5 w-5 flex-col justify-between" aria-hidden="true">
                <span
                  className={cn(
                    "h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-out origin-center",
                    open && "translate-y-[6px] rotate-45"
                  )}
                />
                <span
                  className={cn(
                    "h-0.5 w-5 rounded-full bg-current transition-opacity duration-200",
                    open && "opacity-0"
                  )}
                />
                <span
                  className={cn(
                    "h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-out origin-center",
                    open && "-translate-y-[6px] -rotate-45"
                  )}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      <div
        className={cn(
          "fixed inset-0 top-20 z-40 bg-primary/25 backdrop-blur-sm transition-opacity duration-300 ease-in-out lg:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu Panel with smooth slide-down and fade animation */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed left-0 right-0 top-20 z-40 max-h-[calc(100dvh-5rem)] overflow-y-auto border-b border-outline-variant/30 bg-surface-container-lowest/98 backdrop-blur-2xl shadow-2xl transition-all duration-300 ease-in-out lg:hidden",
          open
            ? "translate-y-0 opacity-100 pointer-events-auto visible"
            : "-translate-y-3 opacity-0 pointer-events-none invisible"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5">
          <nav className="flex flex-col space-y-1" aria-label="Mobile">
            {NAV_LINKS.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3.5 py-2.5 font-label-lg text-label-lg text-on-surface transition-colors hover:bg-surface-container-low",
                    active && "bg-surface-container text-primary font-bold"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span>{n.label}</span>
                  {active && <span className="h-2 w-2 rounded-full bg-secondary" />}
                </Link>
              );
            })}

            <MobileSubmenu
              label="Solutions"
              items={SOLUTIONS}
              active={isSolutionsActive}
              onNavigate={() => setOpen(false)}
            />

            <Link
              href="/accountants"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center justify-between rounded-xl px-3.5 py-2.5 font-label-lg text-label-lg text-on-surface transition-colors hover:bg-surface-container-low",
                pathname === "/accountants" && "bg-surface-container text-primary font-bold"
              )}
              aria-current={pathname === "/accountants" ? "page" : undefined}
            >
              <span>For Accountants</span>
              {pathname === "/accountants" && <span className="h-2 w-2 rounded-full bg-secondary" />}
            </Link>

            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center justify-between rounded-xl px-3.5 py-2.5 font-label-lg text-label-lg text-on-surface transition-colors hover:bg-surface-container-low",
                pathname === "/pricing" && "bg-surface-container text-primary font-bold"
              )}
              aria-current={pathname === "/pricing" ? "page" : undefined}
            >
              <span>Pricing</span>
              {pathname === "/pricing" && <span className="h-2 w-2 rounded-full bg-secondary" />}
            </Link>

            <MobileSubmenu
              label="Resources"
              items={RESOURCES}
              active={isResourcesActive}
              onNavigate={() => setOpen(false)}
            />

            {/* Mobile Actions */}
            <div className="pt-4 mt-3 border-t border-outline-variant/20 flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex h-11 w-full items-center justify-center rounded-xl border border-outline-variant/30 bg-surface font-label-lg text-label-lg font-semibold text-primary transition-all hover:bg-surface-container-low"
              >
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-primary font-label-lg text-label-lg font-semibold text-on-primary shadow-md transition-all hover:bg-primary-container"
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile Tagline */}
            <div className="pt-4 text-center">
              <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#25D366]" aria-hidden="true" />
                WhatsApp-first · No app to install · GST ready
              </p>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
