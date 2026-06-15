"use client";

import { useMemo } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createStitchFromConvexDocument } from "@/lib/clipstitchr/backend/createStitchFromConvexDocument";
import { createSwiprBackgroundAssetFromConvexDocument } from "@/lib/clipstitchr/backend/createSwiprBackgroundAssetFromConvexDocument";
import { createSwiprSwipeFromConvexDocument } from "@/lib/clipstitchr/backend/createSwiprSwipeFromConvexDocument";
import { createVideoClipMetadataFromConvexDocument } from "@/lib/clipstitchr/backend/createVideoClipMetadataFromConvexDocument";
import { emptyClipLibraryCounts } from "@/lib/clipstitchr/constants/emptyClipLibraryCounts";
import type { DashboardSummary } from "@/lib/clipstitchr/types/DashboardSummary";

export function useDashboardSummary() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const document = useQuery(
    api.dashboardSummary.get,
    isAuthenticated ? {} : "skip",
  );
  const summary = useMemo<DashboardSummary>(
    () => ({
      counts: document?.counts ?? emptyClipLibraryCounts,
      recentStitches:
        document?.recentStitches.map((stitch) =>
          createStitchFromConvexDocument({ stitch }),
        ) ?? [],
      recentSwipeBackgrounds:
        document?.recentSwipeBackgrounds.flatMap((background) =>
          background
            ? [createSwiprBackgroundAssetFromConvexDocument(background)]
            : [],
        ) ?? [],
      recentSwipes:
        document?.recentSwipes.map((swipe) =>
          createSwiprSwipeFromConvexDocument(swipe),
        ) ?? [],
      recentUploads:
        document?.recentUploads.map((clip) =>
          createVideoClipMetadataFromConvexDocument(clip),
        ) ??
        [],
      stitchSourceClips:
        document?.stitchSourceClips.flatMap((clip) =>
          clip ? [createVideoClipMetadataFromConvexDocument(clip)] : [],
        ) ?? [],
    }),
    [document],
  );

  return {
    ...summary,
    isLoading: isAuthLoading || (isAuthenticated && document === undefined),
  };
}
