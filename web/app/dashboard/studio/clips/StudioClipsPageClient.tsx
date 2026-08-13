"use client";

import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { StudioClipsHeader } from "@/app/_components/studio/clips/StudioClipsHeader";
import { StudioClipsState } from "@/app/_components/studio/clips/StudioClipsState";
import { StudioClipsWorkspace } from "@/app/_components/studio/clips/StudioClipsWorkspace";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { useStudioClipsCapabilities } from "@/lib/clipstitchr/hooks/studioClips/useStudioClipsCapabilities";
import styles from "./studioClips.module.css";

export function StudioClipsPageClient() {
  const { activeProduct, activeProductId } = useDashboardProduct();
  const capabilityState = useStudioClipsCapabilities(activeProductId);

  return (
    <DashboardShell>
      <div className={styles.page}>
        <StudioClipsHeader
          capabilities={capabilityState.capabilities}
          productName={activeProduct?.name ?? "Studio Product"}
        />
        {!activeProductId ? (
          <StudioClipsState
            message="Use the dashboard Product switcher to choose where these source videos, task notes, and finished clips belong."
            title="Choose a Product first"
          />
        ) : capabilityState.isLoading ? (
          <StudioClipsState
            message="Checking source, processing, and handoff availability for this Product."
            title="Opening the clip bench"
          />
        ) : capabilityState.error || !capabilityState.capabilities ? (
          <StudioClipsState
            actionLabel="Try again"
            message={capabilityState.error ?? "Studio Clips did not return its setup details."}
            onAction={capabilityState.reload}
            title="The clip bench did not open"
          />
        ) : (
          <StudioClipsWorkspace
            capabilities={capabilityState.capabilities}
            key={activeProductId}
            productId={activeProductId}
          />
        )}
      </div>
    </DashboardShell>
  );
}
