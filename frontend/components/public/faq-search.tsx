"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * FAQ search for help centre. The FAQ answers are static content rendered on
 * the server as native <details data-faq-item>; this only toggles their visibility.
 */
function applyFilter(query: string) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll<HTMLDetailsElement>("details[data-faq-item]").forEach((d) => {
    const match = !q || (d.textContent ?? "").toLowerCase().includes(q);
    d.hidden = !match;
    if (match && q.length > 2) d.open = true;
  });
}

const EVENT = "faq-filter";

export function FaqSearchInput() {
  const [value, setValue] = useState("");
  useEffect(() => applyFilter(value), [value]);
  useEffect(() => {
    const onPill = (e: Event) => setValue((e as CustomEvent<string>).detail);
    window.addEventListener(EVENT, onPill);
    return () => window.removeEventListener(EVENT, onPill);
  }, []);
  return (
    <input
      id="faq-search-input"
      type="search"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape") setValue("");
      }}
      aria-label="Search FAQ and Knowledge Base"
      placeholder="Search by keyword (e.g., GSTIN validation, Tally XML sync, WhatsApp photo tips, Sec 17(5))..."
      className="h-16 w-full bg-transparent pr-6 font-body-lg text-body-lg text-on-surface placeholder:text-outline focus:outline-none"
    />
  );
}

export function FaqFilterPill({ term, className, children }: { term: string; className?: string; children: ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new CustomEvent(EVENT, { detail: term }))}>
      {children}
    </button>
  );
}
