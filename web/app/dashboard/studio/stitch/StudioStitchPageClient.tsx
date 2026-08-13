"use client";

import { useSearchParams } from "next/navigation";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { StudioStitchHeader } from "@/app/_components/studio/stitch/StudioStitchHeader";
import { StudioStitchReadinessPanel } from "@/app/_components/studio/stitch/StudioStitchReadinessPanel";
import { StudioStitchState } from "@/app/_components/studio/stitch/StudioStitchState";
import { StudioStitchWorkspace } from "@/app/_components/studio/stitch/StudioStitchWorkspace";
import { useStudioStitchReadiness } from "@/lib/clipstitchr/hooks/studioStitch/useStudioStitchReadiness";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { readStudioHandoffIdentifier } from "@/app/dashboard/studio/readStudioHandoffIdentifier";
import styles from "./studioStitch.module.css";

export function StudioStitchPageClient() {
  const { activeProduct, activeProductId } = useDashboardProduct();
  const searchParams = useSearchParams();
  const briefId = readStudioHandoffIdentifier(searchParams.get("briefId"));
  const sourceId = readStudioHandoffIdentifier(searchParams.get("sourceId"));
  const readiness = useStudioStitchReadiness(activeProductId);

  return (
    <DashboardShell>
      <div className={styles.page}>
        <StudioStitchHeader productName={activeProduct?.name ?? "Studio Product"} />
        {!activeProductId || !activeProduct ? (
          <StudioStitchState
            message="Use the dashboard Product switcher to choose where these recipes, runs, and finished videos belong."
            title="Choose a Product first"
          />
        ) : readiness.isLoading ? (
          <StudioStitchState
            message="Checking the current processing setup without starting any work."
            title="Opening the cut room"
          />
        ) : (
          <>
            <StudioStitchReadinessPanel
              error={readiness.error}
              onRetry={readiness.reload}
              readiness={readiness.readiness}
            />
            <StudioStitchWorkspace
              initialBriefId={briefId}
              initialSourceId={sourceId}
              key={activeProductId}
              product={activeProduct}
            />
          </>
        )}
      </div>
    </DashboardShell>
  );
}
