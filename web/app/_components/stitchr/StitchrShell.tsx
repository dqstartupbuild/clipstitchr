import type { ReactNode } from "react";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";

type StitchrShellProps = {
  children: ReactNode;
  variant?: "page" | "workspace";
};

export function StitchrShell({
  children,
  variant = "page",
}: StitchrShellProps) {
  return <DashboardShell variant={variant}>{children}</DashboardShell>;
}
