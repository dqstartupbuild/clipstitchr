import type { ReactNode } from "react";
import { Panel } from "@/app/_components/ui/Panel";

type DashboardStatCardProps = {
  description: string;
  icon: ReactNode;
  label: string;
  value: number;
};

export function DashboardStatCard({
  description,
  icon,
  label,
  value,
}: DashboardStatCardProps) {
  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-secondary">{label}</p>
          <p className="dashboard-heading mt-2 text-4xl text-text-primary">
            {value}
          </p>
          <p className="mt-2 text-xs leading-5 text-text-tertiary">
            {description}
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted text-accent-dark">
          {icon}
        </div>
      </div>
    </Panel>
  );
}
