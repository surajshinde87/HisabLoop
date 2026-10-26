import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  badge,
  actions,
  eyebrow,
}: {
  title: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-space-md pt-space-md lg:flex-row lg:items-end">
      <div className="min-w-0 space-y-1">
        {eyebrow}
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-primary md:font-headline-lg md:text-headline-lg">{title}</h1>
          {badge}
        </div>
        {description && <p className="font-body-md text-body-md text-on-surface-variant">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-space-sm">{actions}</div>}
    </div>
  );
}
