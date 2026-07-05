import type { ReactNode } from "react";
import { DashboardHeaderActions } from "@/app/_components/dashboard/DashboardHeaderActions";

type DashboardPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  actions = <DashboardHeaderActions />,
}: DashboardPageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="dashboard-eyebrow">{eyebrow}</p>
        <h1 className="dashboard-heading mt-3 max-w-4xl break-words text-4xl text-text-primary sm:text-5xl">
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
