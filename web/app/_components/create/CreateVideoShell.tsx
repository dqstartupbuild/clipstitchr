import type { ReactNode } from "react";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";

type CreateVideoShellProps = {
  children: ReactNode;
};

export function CreateVideoShell({ children }: CreateVideoShellProps) {
  return <DashboardShell>{children}</DashboardShell>;
}
