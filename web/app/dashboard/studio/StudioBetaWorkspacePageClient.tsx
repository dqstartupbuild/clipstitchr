"use client";

import { useQuery } from "convex/react";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { StudioBetaContactSheet } from "@/app/_components/studio/StudioBetaContactSheet";
import { StudioBetaEmptyWorkspace } from "@/app/_components/studio/StudioBetaEmptyWorkspace";
import { StudioBetaNoProduct } from "@/app/_components/studio/StudioBetaNoProduct";
import { StudioBetaTimeline } from "@/app/_components/studio/StudioBetaTimeline";
import { StudioBetaWorkspaceHeader } from "@/app/_components/studio/StudioBetaWorkspaceHeader";
import { api } from "@/convex/_generated/api";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { useStudioBetaPosterUrls } from "@/lib/clipstitchr/hooks/useStudioBetaPosterUrls";
import styles from "./studioBetaWorkspace.module.css";

export function StudioBetaWorkspacePageClient() {
  const { activeProductId, activeProduct } = useDashboardProduct();
  const summary = useQuery(
    api.studioBetaWorkspace.getStudioBetaWorkspaceSummary
      .getStudioBetaWorkspaceSummary,
    activeProductId ? { productId: activeProductId } : "skip",
  );
  const recentMedia = summary?.recentMedia ?? [];
  const posterUrlsByKey = useStudioBetaPosterUrls(recentMedia);

  return (
    <DashboardShell>
      <div className={styles.workspace}>
        <StudioBetaWorkspaceHeader
          productName={summary?.productName ?? activeProduct?.name ?? "Studio"}
        />
        {!activeProductId ? (
          <StudioBetaNoProduct />
        ) : summary === undefined ? (
          <p className={styles.loadingStatus} role="status">
            Setting the cut room...
          </p>
        ) : recentMedia.length === 0 ? (
          <StudioBetaEmptyWorkspace />
        ) : (
          <>
            <StudioBetaContactSheet
              media={recentMedia}
              posterUrlsByKey={posterUrlsByKey}
            />
            <StudioBetaTimeline
              media={recentMedia}
              sourceCount={summary.sourceCount}
              stitchCount={summary.stitchCount}
            />
          </>
        )}
      </div>
    </DashboardShell>
  );
}
