import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Button styles from DESIGN.md: primary navy, accent teal, ghost outline, destructive. */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-label-lg text-label-lg transition-all disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-link/20",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary shadow-card hover:bg-primary-container",
        accent: "bg-brand-teal text-white shadow-card hover:bg-secondary",
        secondary: "bg-surface-container-lowest text-primary shadow-sm hover:bg-surface-container-low",
        ghost: "border border-brand-line bg-white text-brand-ink hover:border-slate-300 hover:bg-brand-canvas",
        subtle: "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
        danger: "bg-danger text-white hover:bg-error",
        "danger-ghost": "border border-danger/30 bg-white text-danger hover:bg-danger-soft",
        link: "text-brand-link underline-offset-4 hover:underline px-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-label-md",
        md: "h-10 px-4",
        lg: "h-12 px-6",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={asChild ? undefined : disabled || loading}
        aria-busy={loading || undefined}
        {...(asChild ? {} : { type: props.type ?? "button" })}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";
