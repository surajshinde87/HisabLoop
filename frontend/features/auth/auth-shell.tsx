import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Card shell for login and role selection (blurred accents + logo lockup). */
export function AuthShell({ title, subtitle, children, wide = false, footer }: { title: string; subtitle?: ReactNode; children: ReactNode; wide?: boolean; footer?: ReactNode }) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-surface p-space-md font-body-md text-body-md text-on-surface antialiased">
      <div className={cn("mx-auto flex w-full flex-col px-0 py-space-xl sm:px-space-lg", wide ? "max-w-5xl" : "max-w-lg")}>
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-xl sm:p-space-2xl">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-secondary-container/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary-fixed/30 blur-3xl" />
          <div className="relative mb-space-xl flex flex-col items-center text-center">
            <Link href="/" className="group mb-space-sm flex items-center gap-3" aria-label="HisabLoop home">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container shadow-md">
                <svg className="h-8 w-8 text-on-primary" fill="none" viewBox="0 0 48 48" aria-hidden>
                  <path d="M14 8C14 6.89543 14.8954 6 16 6H30C31.1046 6 32 6.89543 32 8V38L27 35L23 38L19 35L14 38V8Z" fill="currentColor" fillOpacity="0.15" />
                  <path d="M19 14H27M19 19H25M19 24H23" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
                  <path d="M10 26C8 21 14 17 21 21C28 25 35 29 40 23C42.5 19.5 40 15 36 15C29 15 22 28 17 28C12 28 8 24 10 21" stroke="#53dbc7" strokeLinecap="round" strokeWidth="3" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-baseline">
                  <span className="font-headline-lg text-headline-lg font-bold tracking-tight text-primary">Hisab</span>
                  <span className="font-headline-lg text-headline-lg font-bold tracking-tight text-secondary">Loop</span>
                </div>
                <span className="-mt-1 font-label-sm text-label-sm font-medium tracking-normal text-on-surface-variant">Expenses in. Clarity out.</span>
              </div>
            </Link>
            <h1 className="mb-space-xs mt-space-sm font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface sm:font-headline-xl sm:text-headline-xl">{title}</h1>
            {subtitle && <div className="max-w-xl font-body-md text-body-md text-on-surface-variant">{subtitle}</div>}
          </div>
          <div className="relative">{children}</div>
        </div>
        {footer && <div className="mt-space-md text-center font-body-sm text-body-sm text-on-surface-variant">{footer}</div>}
      </div>
    </main>
  );
}

export function PasswordInputToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-outline hover:text-on-surface" aria-label={shown ? "Hide password" : "Show password"}>
      <span className="material-symbols-outlined text-[20px]" aria-hidden>
        {shown ? "visibility_off" : "visibility"}
      </span>
    </button>
  );
}
