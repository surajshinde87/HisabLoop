import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";

/** Card shell for login and role selection (blurred accents + logo lockup). */
export function AuthShell({ title, subtitle, children, wide = false, footer }: { title: string; subtitle?: ReactNode; children: ReactNode; wide?: boolean; footer?: ReactNode }) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-surface p-space-md font-body-md text-body-md text-on-surface antialiased">
      <div className={cn("mx-auto flex w-full flex-col px-0 py-space-xl sm:px-space-lg", wide ? "max-w-5xl" : "max-w-lg")}>
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-xl sm:p-space-2xl">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-secondary-container/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary-fixed/30 blur-3xl" />
          <div className="relative mb-space-xl flex flex-col items-center text-center">
          <Logo className="shrink-0 transition-transform duration-200 hover:scale-[1.01]" />
        
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
