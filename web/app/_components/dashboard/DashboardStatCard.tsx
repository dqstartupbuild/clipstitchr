import type { ReactNode } from "react";
import { Panel } from "@/app/_components/ui/Panel";

type DashboardStatCardProps = {
  icon: ReactNode;
  label: string;
  value: number;
};

export function DashboardStatCard({
  icon,
  label,
  value,
}: DashboardStatCardProps) {
  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-text-secondary">{label}</p>
          <p className="mt-2 text-3xl font-bold text-text-primary">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-muted text-accent">
          {icon}
        </div>
      </div>
    </Panel>
  );
}
