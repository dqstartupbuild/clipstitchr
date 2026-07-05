import type { ReactNode } from "react";

type DashboardEmptyStateProps = {
  action?: ReactNode;
  description: string;
  secondaryAction?: ReactNode;
  title: string;
};

export function DashboardEmptyState({
  action,
  description,
  secondaryAction,
  title,
}: DashboardEmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-slate-50 p-8 text-center">
      <p className="text-base font-bold text-text-primary">{title}</p>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
      {action || secondaryAction ? (
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
