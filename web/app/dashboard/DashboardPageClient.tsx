"use client";

import { useCallback, useMemo } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { StitchrCallout } from "@/app/_components/dashboard/StitchrCallout";
import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";
import { DashboardHeader } from "@/app/_components/dashboard/DashboardHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { DashboardStats } from "@/app/_components/dashboard/DashboardStats";
import { DemoCliDashboardCallout } from "@/app/_components/dashboard/DemoCliDashboardCallout";
import { RecentStitchesSection } from "@/app/_components/dashboard/RecentStitchesSection";
import { RecentSwipesSection } from "@/app/_components/dashboard/RecentSwipesSection";
import { RecentUploadsSection } from "@/app/_components/dashboard/RecentUploadsSection";
import { api } from "@/convex/_generated/api";
import { createStitchFromConvexDocument } from "@/lib/clipstitchr/backend/createStitchFromConvexDocument";
import { createSwiprBackgroundAssetFromConvexDocument } from "@/lib/clipstitchr/backend/createSwiprBackgroundAssetFromConvexDocument";
import { createSwiprSwipeFromConvexDocument } from "@/lib/clipstitchr/backend/createSwiprSwipeFromConvexDocument";
import { createVideoClipMetadataFromConvexDocument } from "@/lib/clipstitchr/backend/createVideoClipMetadataFromConvexDocument";
import { downloadBlobFromR2 } from "@/lib/clipstitchr/client/r2/downloadBlobFromR2";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { useCreateStitchTemplate } from "@/lib/clipstitchr/hooks/useCreateStitchTemplate";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { usePhotoLibrary } from "@/lib/clipstitchr/hooks/usePhotoLibrary";
import { useSwiprLibrary } from "@/lib/clipstitchr/hooks/useSwiprLibrary";

export function DashboardPageClient() {
  const { isAuthenticated } = useConvexAuth();
  const library = useClipLibrary();
  const photoLibrary = usePhotoLibrary();
  const products = useDashboardProduct();
  const stitchTemplateCreator = useCreateStitchTemplate();
  const swiprLibrary = useSwiprLibrary();
  const productQueryArgs = products.activeProductId
    ? { productId: products.activeProductId }
    : {};
  const dashboardSummary = useQuery(
    api.dashboardSummary.get,
    isAuthenticated ? productQueryArgs : "skip",
  );
  const recentUploads = useMemo(
    () =>
      dashboardSummary?.recentUploads.map((clip) =>
        createVideoClipMetadataFromConvexDocument(clip),
      ) ?? [],
    [dashboardSummary],
  );
  const recentStitches = useMemo(
    () =>
      dashboardSummary?.recentStitches.map((stitch) =>
        createStitchFromConvexDocument({ stitch }),
      ) ?? [],
    [dashboardSummary],
  );
  const stitchrUgcClips = useMemo(
    () =>
      dashboardSummary?.stitchrUgcSourceClips.map((clip) =>
        createVideoClipMetadataFromConvexDocument(clip),
      ) ?? [],
    [dashboardSummary],
  );
  const demoClips = useMemo(
    () =>
      dashboardSummary?.demoClips.map((clip) =>
        createVideoClipMetadataFromConvexDocument(clip),
      ) ?? [],
    [dashboardSummary],
  );
  const recentSwipes = useMemo(
    () =>
      dashboardSummary?.recentSwipes.map((swipe) =>
        createSwiprSwipeFromConvexDocument(swipe),
      ) ?? [],
    [dashboardSummary],
  );
  const swipeBackgrounds = useMemo(
    () =>
      dashboardSummary?.swipeBackgrounds.map((background) =>
        createSwiprBackgroundAssetFromConvexDocument(background),
      ) ?? [],
    [dashboardSummary],
  );
  const loadDashboardBackgroundBlob = useCallback(
    async (id: string) => {
      const background = swipeBackgrounds.find((item) => item.id === id);

      if (background?.imageObject) {
        return await downloadBlobFromR2(background.imageObject);
      }

      return await swiprLibrary.loadBackgroundBlob(id);
    },
    [swipeBackgrounds, swiprLibrary],
  );
  const error =
    library.error ??
    photoLibrary.error ??
    swiprLibrary.error ??
    products.error ??
    stitchTemplateCreator.error;

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <DashboardHeader />
        {error ? (
          <DashboardAlert variant="error">{error}</DashboardAlert>
        ) : null}
        <DashboardStats
          ugcCount={library.counts.ugcClips}
          demoCount={library.counts.demoClips}
          stitchesCount={library.counts.stitches}
        />
        <DemoCliDashboardCallout />
        <RecentUploadsSection
          clips={recentUploads}
          products={products.products}
          onLoadClip={library.loadClip}
          onLoadPoster={library.loadClipPoster}
          onDelete={library.removeClip}
          onScoreClip={library.scoreClip}
          onApplyQuickEdit={library.applyClipQuickEdit}
          onResetQuickEdit={library.resetClipQuickEdit}
          onUpdateMetadata={library.updateClipMetadata}
          onUpdateCrop={library.updateClipCrop}
          onUpdateCuts={library.updateClipCuts}
          onUpdateTrim={library.updateClipTrimRange}
          onUpdatePostedStatus={library.updateClipPostedStatus}
        />
        <RecentStitchesSection
          demoClips={demoClips}
          savingTemplateStitchId={stitchTemplateCreator.savingStitchId}
          stitches={recentStitches}
          onDelete={library.removeStitch}
          onLoadClip={library.loadClip}
          onLoadPoster={library.loadStitchPoster}
          onLoadVideo={library.loadStitchVideo}
          onPostBridgeScheduled={library.refresh}
          onSaveTemplate={stitchTemplateCreator.createTemplateFromStitch}
          onScore={library.scoreStitch}
          onApplyQuickEdit={library.applyStitchQuickEdit}
          onResetQuickEdit={library.resetStitchQuickEdit}
          onUpdateMusic={library.updateStitchMusic}
          onUpdatePostedStatus={library.updateStitchPostedStatus}
          onUpdateSocialCaption={library.updateStitchSocialCaption}
          onUpdateSourceCrop={library.updateStitchSourceCrop}
          onUpdateSourceCuts={library.updateStitchSourceCuts}
          onUpdateSourceSettings={library.updateStitchSourceSettings}
          onUpdateTextOverlay={library.updateStitchTextOverlay}
          ugcClips={stitchrUgcClips}
        />
        <RecentSwipesSection
          backgrounds={swipeBackgrounds}
          swipes={recentSwipes}
          onLoadBackgroundBlob={loadDashboardBackgroundBlob}
          onLoadPoster={swiprLibrary.loadSwipePoster}
          onDelete={swiprLibrary.removeSwipe}
          onPostBridgeScheduled={swiprLibrary.refresh}
          onUpdatePostedStatus={swiprLibrary.updateSwipePostedStatus}
        />
        <StitchrCallout />
      </div>
    </DashboardShell>
  );
}
