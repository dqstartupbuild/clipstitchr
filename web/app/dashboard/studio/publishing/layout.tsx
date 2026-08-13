import type { ReactNode } from "react";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { PublishingWorkspaceShell } from "@/app/_components/publishing/PublishingWorkspaceShell";
import { assertStudioBetaPageAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaPageAccess";
import "./publishing.css";

type PublishingLayoutProps = {
  children: ReactNode;
};

export default async function PublishingLayout({ children }: PublishingLayoutProps) {
  await assertStudioBetaPageAccess();

  return (
    <DashboardShell>
      <PublishingWorkspaceShell>{children}</PublishingWorkspaceShell>
    </DashboardShell>
  );
}
