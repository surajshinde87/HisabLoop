import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The HisabLoop logo exactly as the Stitch designs build it: the Material Symbol "all_inclusive"
 * in a navy rounded tile + "Hisab" (navy) "Loop" (teal) wordmark + tagline.
 */
export function Logo({
  variant = "public",
  href = "/",
  className,
  showTagline = true,
}: {
  variant?: "public" | "app" | "dark";
  href?: string | null;
  className?: string;
  showTagline?: boolean;
}) {
  const content =
    variant === "app" ? (
      <span className={cn("flex items-start gap-space-sm", className)}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
          <span className="material-symbols-outlined text-[20px] text-secondary-container" aria-hidden>
            all_inclusive
          </span>
        </span>
        <span className="flex flex-col overflow-hidden">
          <span className="flex items-center gap-1">
            <span className="font-headline-sm text-headline-sm tracking-tight text-primary">Hisab</span>
            <span className="font-headline-sm text-headline-sm tracking-tight text-secondary">Loop</span>
          </span>
          {showTagline && <span className="truncate font-label-sm text-label-sm text-on-surface-variant">Expenses in. Clarity out.</span>}
        </span>
      </span>
    ) : (
      <span className={cn("group flex items-center gap-space-sm", className)}>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container shadow-sm">
          <span className="material-symbols-outlined text-secondary-container" aria-hidden>
            all_inclusive
          </span>
        </span>
        <span className="flex flex-col">
          <span className={cn("font-headline-md text-headline-md leading-none tracking-tight", variant === "dark" ? "text-white" : "text-primary")}>
            Hisab<span className={variant === "dark" ? "text-secondary-container" : "text-secondary"}>Loop</span>
          </span>
          {showTagline && (
            <span className={cn("mt-0.5 font-label-sm text-label-sm font-medium tracking-wide", variant === "dark" ? "text-on-primary-container" : "text-on-surface-variant")}>
              Expenses in. Clarity out.
            </span>
          )}
        </span>
      </span>
    );
  if (href === null) return content;
  return (
    <Link href={href} aria-label="HisabLoop home" className="rounded-xl">
      {content}
    </Link>
  );
}
