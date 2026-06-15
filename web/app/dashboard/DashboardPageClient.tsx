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
import { useDashboardSummary } from "@/lib/clipstitchr/hooks/useDashboardSummary";
import { useProducts } from "@/lib/clipstitchr/hooks/useProducts";
import { useStitchTemplateActions } from "@/lib/clipstitchr/hooks/useStitchTemplateActions";
import { useSwiprLibrary } from "@/lib/clipstitchr/hooks/useSwiprLibrary";
import { getStitchrUgcSourceClips } from "@/lib/clipstitchr/utils/getStitchrUgcSourceClips";

export function DashboardPageClient() {
  const library = useClipLibrary();
  const dashboardSummary = useDashboardSummary();
  const products = useProducts();
  const stitchTemplateActions = useStitchTemplateActions();
  const swiprLibrary = useSwiprLibrary();
  const stitchSourceDemoClips = useMemo(
    () =>
      dashboardSummary.stitchSourceClips.filter(
        (clip) => clip.clipType === "demo",
      ),
    [dashboardSummary.stitchSourceClips],
  );
  const stitchrUgcClips = useMemo(
    () =>
      getStitchrUgcSourceClips(
        dashboardSummary.stitchSourceClips.filter(
          (clip) => clip.libraryKind === "ugc",
        ),
        dashboardSummary.stitchSourceClips.filter(
          (clip) => clip.libraryKind === "clipr",
        ),
        dashboardSummary.stitchSourceClips.filter(
          (clip) => clip.libraryKind === "swapr",
        ),
      ),
    [dashboardSummary.stitchSourceClips],
  );
  const error =
    library.error ??
    swiprLibrary.error ??
    products.error ??
    stitchTemplateActions.error;

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
          ugcCount={dashboardSummary.counts.ugcClips}
          demoCount={dashboardSummary.counts.demoClips}
          stitchesCount={dashboardSummary.counts.stitches}
        />
        <RecentUploadsSection
          clips={dashboardSummary.recentUploads}
          products={products.products}
          onLoadClip={library.loadClip}
          onLoadPoster={library.loadClipPoster}
          onDelete={library.removeClip}
          onScoreClip={library.scoreClip}
          onUpdateMetadata={library.updateClipMetadata}
          onUpdateTrim={library.updateClipTrimRange}
          onUpdatePostedStatus={library.updateClipPostedStatus}
        />
        <RecentStitchesSection
          demoClips={stitchSourceDemoClips}
          savingTemplateStitchId={stitchTemplateActions.savingStitchId}
          stitches={dashboardSummary.recentStitches}
          onDelete={library.removeStitch}
          onGenerateMusic={library.generateStitchMusic}
          onLoadClip={library.loadClip}
          onLoadPoster={library.loadStitchPoster}
          onLoadVideo={library.loadStitchVideo}
          onSaveTemplate={stitchTemplateActions.createTemplateFromStitch}
          onScore={library.scoreStitch}
          onUpdateMusic={library.updateStitchMusic}
          onUpdatePostedStatus={library.updateStitchPostedStatus}
          onUpdateSocialCaption={library.updateStitchSocialCaption}
          onUpdateSourceSettings={library.updateStitchSourceSettings}
          onUpdateTextOverlay={library.updateStitchTextOverlay}
          ugcClips={stitchrUgcClips}
        />
        <RecentSwipesSection
          backgrounds={dashboardSummary.recentSwipeBackgrounds}
          isSaving={swiprLibrary.isSavingSwipe}
          swipes={dashboardSummary.recentSwipes}
          onLoadBackgroundBlob={swiprLibrary.loadBackgroundBlob}
          onLoadPoster={swiprLibrary.loadSwipePoster}
          onDelete={swiprLibrary.removeSwipe}
          onSave={swiprLibrary.saveSwipe}
          onUpdatePostedStatus={swiprLibrary.updateSwipePostedStatus}
        />
        <StitchrCallout />
      </div>
    </DashboardShell>
  );
}
