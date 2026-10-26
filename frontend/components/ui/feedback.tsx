import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { errorMessage } from "@/lib/api-client";
import { Button } from "./button";
import { Icon } from "./icon";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-surface-container", className)} aria-hidden />;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand-teal border-r-transparent", className)}
    />
  );
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  className,
}: {
  icon?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-6 py-12 text-center", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container-low text-on-surface-variant">
        <Icon name={icon} />
      </div>
      <p className="font-headline-sm text-headline-sm text-primary">{title}</p>
      {description && <p className="max-w-md font-body-md text-body-md text-on-surface-variant">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, className }: { error: unknown; onRetry?: () => void; className?: string }) {
  return (
    <div role="alert" className={cn("flex flex-col items-center justify-center gap-2 px-6 py-10 text-center", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <Icon name="error_outline" />
      </div>
      <p className="font-headline-sm text-headline-sm text-primary">Could not load this</p>
      <p className="max-w-md font-body-md text-body-md text-on-surface-variant">{errorMessage(error)}</p>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry} className="mt-2">
          <Icon name="refresh" className="text-[18px]" /> Try again
        </Button>
      )}
    </div>
  );
}

export function Notice({
  tone = "info",
  icon,
  children,
  className,
}: {
  tone?: "info" | "warning" | "danger" | "success";
  icon?: string;
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    info: "bg-surface-container-low text-on-surface",
    warning: "bg-warning-soft text-warning-text",
    danger: "bg-danger-soft text-danger",
    success: "bg-success-soft text-success",
  };
  const icons = { info: "info", warning: "warning", danger: "error", success: "check_circle" };
  return (
    <div className={cn("flex items-start gap-2.5 rounded-xl px-3.5 py-3 font-body-sm text-body-sm", tones[tone], className)}>
      <Icon name={icon ?? icons[tone]} className="mt-px text-[18px]" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
