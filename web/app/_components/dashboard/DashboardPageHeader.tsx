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
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold text-accent-dark">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold text-text-primary">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>
      {actions}
    </header>
  );
}
