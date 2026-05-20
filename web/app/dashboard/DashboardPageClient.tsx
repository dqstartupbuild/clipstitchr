"use client";

import { useMemo } from "react";
import { StitchrCallout } from "@/app/_components/dashboard/StitchrCallout";
import { DashboardHeader } from "@/app/_components/dashboard/DashboardHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { DashboardStats } from "@/app/_components/dashboard/DashboardStats";
import { RecentAvatarsSection } from "@/app/_components/dashboard/RecentAvatarsSection";
import { RecentLongsSection } from "@/app/_components/dashboard/RecentLongsSection";
import { RecentStitchesSection } from "@/app/_components/dashboard/RecentStitchesSection";
import { RecentSwipesSection } from "@/app/_components/dashboard/RecentSwipesSection";
import { RecentUploadsSection } from "@/app/_components/dashboard/RecentUploadsSection";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { usePhotoLibrary } from "@/lib/clipstitchr/hooks/usePhotoLibrary";
import { useProducts } from "@/lib/clipstitchr/hooks/useProducts";
import { useSwiprLibrary } from "@/lib/clipstitchr/hooks/useSwiprLibrary";
import { filterClipsByType } from "@/lib/clipstitchr/utils/filterClipsByType";
import { filterCliprClips } from "@/lib/clipstitchr/utils/filterCliprClips";
import { filterPlainUgcClips } from "@/lib/clipstitchr/utils/filterPlainUgcClips";
import { getRecentAvatarPhotos } from "@/lib/clipstitchr/utils/getRecentAvatarPhotos";
import { getRecentLongrVideos } from "@/lib/clipstitchr/utils/getRecentLongrVideos";
import { getRecentStitches } from "@/lib/clipstitchr/utils/getRecentStitches";
import { getRecentSwiprSwipes } from "@/lib/clipstitchr/utils/getRecentSwiprSwipes";
import { getRecentVideoClips } from "@/lib/clipstitchr/utils/getRecentVideoClips";

const RECENT_DASHBOARD_ITEM_LIMIT = 4;

export function DashboardPageClient() {
  const library = useClipLibrary();
  const photoLibrary = usePhotoLibrary();
  const products = useProducts();
  const swiprLibrary = useSwiprLibrary();
  const ugcClips = useMemo(
    () => filterPlainUgcClips(library.clips),
    [library.clips],
  );
  const cliprClips = useMemo(
    () => filterCliprClips(library.clips),
    [library.clips],
  );
  const demoClips = useMemo(
    () => filterClipsByType(library.clips, "demo"),
    [library.clips],
  );
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
  const recentLongs = useMemo(
    () => getRecentLongrVideos(library.longrVideos, RECENT_DASHBOARD_ITEM_LIMIT),
    [library.longrVideos],
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
  const recentAvatarPhotos = useMemo(
    () =>
      getRecentAvatarPhotos(
        photoLibrary.photos,
        RECENT_DASHBOARD_ITEM_LIMIT,
    ),
    [photoLibrary.photos],
  );
  const error =
    library.error ?? photoLibrary.error ?? swiprLibrary.error ?? products.error;

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
          ugcCount={ugcClips.length}
          demoCount={demoClips.length}
          clipsCount={cliprClips.length}
          stitchesCount={library.stitches.length}
        />
        <RecentStitchesSection
          stitches={recentStitches}
          onDelete={library.removeStitch}
          onGenerateMusic={library.generateStitchMusic}
          onLoadClip={library.loadClip}
          onLoadPoster={library.loadStitchPoster}
          onUpdateMusic={library.updateStitchMusic}
          onUpdateTextOverlay={library.updateStitchTextOverlay}
        />
        <RecentLongsSection
          longrVideos={recentLongs}
          onDelete={library.removeLongrVideo}
          onLoadLongrVideo={library.loadLongrVideo}
          onLoadPoster={library.loadLongrPoster}
        />
        <RecentSwipesSection
          backgrounds={swiprLibrary.backgrounds}
          swipes={recentSwipes}
          onLoadBackgroundBlob={swiprLibrary.loadBackgroundBlob}
          onDelete={swiprLibrary.removeSwipe}
        />
        <RecentUploadsSection
          clips={recentUploads}
          products={products.products}
          onLoadClip={library.loadClip}
          onLoadPoster={library.loadClipPoster}
          onDelete={library.removeClip}
          onUpdateMetadata={library.updateClipMetadata}
          onUpdateTrim={library.updateClipTrimRange}
        />
        <RecentAvatarsSection
          avatars={photoLibrary.avatars}
          photos={recentAvatarPhotos}
          onLoadPhoto={photoLibrary.loadPhoto}
          onDelete={photoLibrary.removePhoto}
          onUpdateMetadata={photoLibrary.updatePhotoMetadata}
        />
        <StitchrCallout />
      </div>
    </DashboardShell>
  );
}
