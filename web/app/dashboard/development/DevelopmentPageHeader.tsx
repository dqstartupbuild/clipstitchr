import type { ReactNode } from "react";

type DevelopmentPageHeaderProps = {
  actions?: ReactNode;
  description: string;
  title: string;
};

export function DevelopmentPageHeader({
  actions,
  description,
  title,
}: DevelopmentPageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 pb-2 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="dashboard-heading max-w-4xl break-words text-4xl text-text-primary sm:text-5xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
