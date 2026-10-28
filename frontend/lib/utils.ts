import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge must know the custom type scale (text-headline-md etc.); otherwise it treats
 * those classes as text colours and drops them when a colour class follows.
 */
const TYPE_SCALE = [
  "body-sm", "body-md", "body-lg", "label-sm", "label-md", "label-lg", "headline-sm", "headline-md", "headline-lg",
  "headline-xl", "headline-lg-mobile", "headline-xl-mobile", "currency-md", "currency-display",
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: TYPE_SCALE }],
      "font-family": [{ font: [...TYPE_SCALE, "display", "sans"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function firstName(name: string | null | undefined): string {
  return name?.trim().split(/\s+/)[0] ?? "";
}
