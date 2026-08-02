import type { ReactNode } from "react";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { PublishingWorkspaceShell } from "@/app/_components/publishing/PublishingWorkspaceShell";

type PublishingLayoutProps = {
  children: ReactNode;
};

export default function PublishingLayout({ children }: PublishingLayoutProps) {
  return (
    <DashboardShell contentAs="div">
      <PublishingWorkspaceShell>{children}</PublishingWorkspaceShell>
    </DashboardShell>
  );
}
