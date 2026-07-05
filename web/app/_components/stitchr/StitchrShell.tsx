import type { ReactNode } from "react";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";

type StitchrShellProps = {
  children: ReactNode;
};

export function StitchrShell({ children }: StitchrShellProps) {
  return <DashboardShell>{children}</DashboardShell>;
}
