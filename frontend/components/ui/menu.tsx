"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Minimal accessible popover menu (click to open, closes on outside click or Escape). */
export function Menu({
  trigger,
  children,
  align = "left",
  className,
  label,
}: {
  trigger: (open: boolean) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
  className?: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={open} aria-label={label} onClick={() => setOpen((v) => !v)} className="block">
        {trigger(open)}
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute top-full z-50 mt-1.5 min-w-[220px] rounded-xl bg-surface-container-lowest p-1.5 shadow-hover ring-1 ring-brand-line",
            align === "right" ? "right-0" : "left-0",
            className,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function MenuItem({ children, onClick, active, href }: { children: ReactNode; onClick?: () => void; active?: boolean; href?: string }) {
  const cls = cn(
    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-body-md text-body-md text-on-surface hover:bg-surface-container-low",
    active && "bg-surface-container-low font-semibold",
  );
  if (href)
    return (
      <a role="menuitem" href={href} className={cls} onClick={onClick}>
        {children}
      </a>
    );
  return (
    <button role="menuitem" type="button" className={cls} onClick={onClick}>
      {children}
    </button>
  );
}
