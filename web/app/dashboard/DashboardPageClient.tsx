"use client";

import { useMemo } from "react";
import { StitchrCallout } from "@/app/_components/dashboard/StitchrCallout";
import { DashboardHeader } from "@/app/_components/dashboard/DashboardHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { DashboardStats } from "@/app/_components/dashboard/DashboardStats";
import { RecentStitchesSection } from "@/app/_components/dashboard/RecentStitchesSection";
import { RecentSwipesSection } from "@/app/_components/dashboard/RecentSwipesSection";
import { RecentUploadsSection } from "@/app/_components/dashboard/RecentUploadsSection";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { usePhotoLibrary } from "@/lib/clipstitchr/hooks/usePhotoLibrary";
import { useProducts } from "@/lib/clipstitchr/hooks/useProducts";
import { useStitchTemplates } from "@/lib/clipstitchr/hooks/useStitchTemplates";
import { useSwiprLibrary } from "@/lib/clipstitchr/hooks/useSwiprLibrary";
import { getRecentStitches } from "@/lib/clipstitchr/utils/getRecentStitches";
import { getRecentSwiprSwipes } from "@/lib/clipstitchr/utils/getRecentSwiprSwipes";
import { getRecentVideoClips } from "@/lib/clipstitchr/utils/getRecentVideoClips";
import { getStitchrUgcSourceClips } from "@/lib/clipstitchr/utils/getStitchrUgcSourceClips";

const RECENT_DASHBOARD_ITEM_LIMIT = 4;

export function DashboardPageClient() {
  const library = useClipLibrary();
  const photoLibrary = usePhotoLibrary();
  const products = useProducts();
  const stitchTemplates = useStitchTemplates();
  const swiprLibrary = useSwiprLibrary();
  const recentUploads = useMemo(
    () => getRecentVideoClips(library.clips, RECENT_DASHBOARD_ITEM_LIMIT),
    [library.clips],
  );
  const recentStitches = useMemo(
    () =>
      getRecentStitches(
        library.stitches,
        RECENT_DASHBOARD_ITEM_LIMIT,
    ),
    [library.stitches],
  );
  const stitchrUgcClips = useMemo(
    () =>
      getStitchrUgcSourceClips(
        library.videoGroups.ugc.clips,
        library.videoGroups.clipr.clips,
        library.videoGroups.swapr.clips,
      ),
    [
      library.videoGroups.clipr.clips,
      library.videoGroups.swapr.clips,
      library.videoGroups.ugc.clips,
    ],
  );
  const recentSwipes = useMemo(() => {
    const backgroundIds = new Set(
      swiprLibrary.backgrounds.map((background) => background.id),
    );

    return getRecentSwiprSwipes(
      swiprLibrary.swipes.filter((swipe) =>
        backgroundIds.has(swipe.backgroundId),
      ),
      RECENT_DASHBOARD_ITEM_LIMIT,
    );
  }, [swiprLibrary.backgrounds, swiprLibrary.swipes]);
  const error =
    library.error ??
    photoLibrary.error ??
    swiprLibrary.error ??
    products.error ??
    stitchTemplates.error;

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <DashboardHeader />
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        <DashboardStats
          ugcCount={library.counts.ugcClips}
          demoCount={library.counts.demoClips}
          stitchesCount={library.counts.stitches}
        />
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
          onUpdateTrim={library.updateClipTrimRange}
          onUpdatePostedStatus={library.updateClipPostedStatus}
        />
        <RecentStitchesSection
          demoClips={library.videoGroups.demo.clips}
          savingTemplateStitchId={stitchTemplates.savingStitchId}
          stitches={recentStitches}
          onDelete={library.removeStitch}
          onLoadClip={library.loadClip}
          onLoadPoster={library.loadStitchPoster}
          onLoadVideo={library.loadStitchVideo}
          onSaveTemplate={stitchTemplates.createTemplateFromStitch}
          onScore={library.scoreStitch}
          onApplyQuickEdit={library.applyStitchQuickEdit}
          onResetQuickEdit={library.resetStitchQuickEdit}
          onUpdateMusic={library.updateStitchMusic}
          onUpdatePostedStatus={library.updateStitchPostedStatus}
          onUpdateSocialCaption={library.updateStitchSocialCaption}
          onUpdateSourceCrop={library.updateStitchSourceCrop}
          onUpdateSourceSettings={library.updateStitchSourceSettings}
          onUpdateTextOverlay={library.updateStitchTextOverlay}
          ugcClips={stitchrUgcClips}
        />
        <RecentSwipesSection
          backgrounds={swiprLibrary.backgrounds}
          swipes={recentSwipes}
          onLoadBackgroundBlob={swiprLibrary.loadBackgroundBlob}
          onLoadPoster={swiprLibrary.loadSwipePoster}
          onDelete={swiprLibrary.removeSwipe}
          onUpdatePostedStatus={swiprLibrary.updateSwipePostedStatus}
        />
        <StitchrCallout />
      </div>
    </DashboardShell>
  );
}
