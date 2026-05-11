"use client";

import { useMemo } from "react";
import { StitchrCallout } from "@/app/_components/dashboard/StitchrCallout";
import { DashboardHeader } from "@/app/_components/dashboard/DashboardHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { DashboardStats } from "@/app/_components/dashboard/DashboardStats";
import { RecentAvatarsSection } from "@/app/_components/dashboard/RecentAvatarsSection";
import { RecentStitchesSection } from "@/app/_components/dashboard/RecentStitchesSection";
import { RecentUploadsSection } from "@/app/_components/dashboard/RecentUploadsSection";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { usePhotoLibrary } from "@/lib/clipstitchr/hooks/usePhotoLibrary";
import { filterCliprClips } from "@/lib/clipstitchr/utils/filterCliprClips";
import { filterClipsByType } from "@/lib/clipstitchr/utils/filterClipsByType";
import { filterNonGeneratedClips } from "@/lib/clipstitchr/utils/filterNonGeneratedClips";
import { getRecentAvatarPhotos } from "@/lib/clipstitchr/utils/getRecentAvatarPhotos";
import { getRecentStitches } from "@/lib/clipstitchr/utils/getRecentStitches";
import { getRecentVideoClips } from "@/lib/clipstitchr/utils/getRecentVideoClips";

const RECENT_DASHBOARD_ITEM_LIMIT = 4;

export function DashboardPageClient() {
  const library = useClipLibrary();
  const photoLibrary = usePhotoLibrary();
  const ugcClips = useMemo(
    () => filterClipsByType(filterNonGeneratedClips(library.clips), "ugc"),
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
  const recentAvatarPhotos = useMemo(
    () =>
      getRecentAvatarPhotos(
        photoLibrary.photos,
        RECENT_DASHBOARD_ITEM_LIMIT,
      ),
    [photoLibrary.photos],
  );
  const error = library.error ?? photoLibrary.error;

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
          cliprCount={cliprClips.length}
          stitchesCount={library.stitches.length}
        />
        <RecentStitchesSection
          stitches={recentStitches}
          onDelete={library.removeStitch}
        />
        <RecentUploadsSection
          clips={recentUploads}
          onLoadClip={library.loadClip}
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
