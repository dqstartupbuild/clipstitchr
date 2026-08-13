"use client";

import type { ReactNode } from "react";
import { PublishingStateMessage } from "@/app/_components/publishing/common/PublishingStateMessage";
import { StudioPublishingNavigation } from "@/app/_components/publishing/StudioPublishingNavigation";
import { StudioBetaWorkspaceNavigation } from "@/app/_components/studio/StudioBetaWorkspaceNavigation";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";

type PublishingWorkspaceShellProps = {
  children: ReactNode;
};

export function PublishingWorkspaceShell({
  children,
}: PublishingWorkspaceShellProps) {
  const { activeProduct, activeProductId, isLoading } = useDashboardProduct();
  const productName = activeProduct?.name ?? "your Product";

  return (
    <div className="publishing-workspace-shell">
      <div className="publishing-studio-navigation">
        <StudioBetaWorkspaceNavigation current="publishing" />
      </div>
      <div className="publishing-workspace-frame">
        <aside aria-label="Publishing workspace">
          <StudioPublishingNavigation productName={productName} />
        </aside>
        <div
          className="publishing-workspace-content"
          key={activeProductId ?? "publishing-product-unselected"}
        >
          {isLoading ? (
            <section className="publishing-view">
              <PublishingStateMessage
                message="Finding the Product this publishing workspace belongs to."
                title="Opening publishing"
              />
            </section>
          ) : !activeProductId ? (
            <section className="publishing-view">
              <PublishingStateMessage
                message="Use the dashboard Product switcher to choose where drafts, schedules, and provider results belong."
                title="Choose a Product first"
              />
            </section>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
