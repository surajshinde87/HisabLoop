import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Inputs per DESIGN.md: 40px (44px mobile), 1px #E5EAF1 border, 8px radius, blue focus ring. */
const fieldBase =
  "w-full rounded-lg border border-brand-line bg-white px-3 font-body-md text-body-md text-brand-ink placeholder:text-outline transition focus:border-brand-link focus:outline-none focus:ring-[3px] focus:ring-brand-link/15 disabled:cursor-not-allowed disabled:bg-brand-canvas aria-[invalid=true]:border-danger";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldBase, "h-11 md:h-10", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldBase, "min-h-[88px] py-2.5", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn(fieldBase, "h-11 cursor-pointer pr-8 md:h-10", className)} {...props}>
    {children}
  </select>
));
Select.displayName = "Select";

/** ₹-prefixed currency input (DESIGN.md "Currency Input"). */
export const CurrencyInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <div className="relative">
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-brand-muted">₹</span>
    <input ref={ref} inputMode="decimal" className={cn(fieldBase, "h-11 pl-7 font-semibold tabular-nums md:h-10", className)} {...props} />
  </div>
));
CurrencyInput.displayName = "CurrencyInput";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
  required,
}: {
  label: ReactNode;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="font-label-md text-label-md text-on-surface">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="font-body-sm text-body-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="font-body-sm text-body-sm text-brand-muted">{hint}</p>
      ) : null}
    </div>
  );
}
