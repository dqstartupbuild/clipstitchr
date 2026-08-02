"use client";

import type { ReactNode } from "react";
import { LayoutComponent as PostizPublishingLayout } from "@/vendor/postiz/apps/frontend/src/components/new-layout/layout.component";

type PublishingWorkspaceShellProps = {
  children: ReactNode;
};

export function PublishingWorkspaceShell({
  children,
}: PublishingWorkspaceShellProps) {
  return (
    <div className="publishing-workspace-shell">
      <PostizPublishingLayout>{children}</PostizPublishingLayout>
    </div>
  );
}
