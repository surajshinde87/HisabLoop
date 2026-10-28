import { cn } from "@/lib/utils";

/** Material Symbols Outlined glyph. */
export function Icon({ name, className, filled = false, label }: { name: string; className?: string; filled?: boolean; label?: string }) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", filled && "filled", className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      {name}
    </span>
  );
}
