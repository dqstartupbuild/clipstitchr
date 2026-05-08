"use client";

import { useMemo } from "react";
import { StitchrCallout } from "@/app/_components/dashboard/StitchrCallout";
import { DashboardHeader } from "@/app/_components/dashboard/DashboardHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { DashboardStats } from "@/app/_components/dashboard/DashboardStats";
import { RecentStitchesSection } from "@/app/_components/dashboard/RecentStitchesSection";
import { RecentUploadsSection } from "@/app/_components/dashboard/RecentUploadsSection";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { filterClipsByType } from "@/lib/clipstitchr/utils/filterClipsByType";
import { getRecentStitches } from "@/lib/clipstitchr/utils/getRecentStitches";
import { getRecentVideoClips } from "@/lib/clipstitchr/utils/getRecentVideoClips";

const RECENT_DASHBOARD_ITEM_LIMIT = 4;

export function DashboardPageClient() {
  const library = useClipLibrary();
  const ugcClips = useMemo(
    () => filterClipsByType(library.clips, "ugc"),
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

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <DashboardHeader />
        {library.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {library.error}
          </div>
        ) : null}
        <DashboardStats
          ugcCount={ugcClips.length}
          demoCount={demoClips.length}
          stitchesCount={library.stitches.length}
        />
        <RecentStitchesSection
          stitches={recentStitches}
          onDelete={library.removeStitch}
        />
        <RecentUploadsSection
          clips={recentUploads}
          onDelete={library.removeClip}
          onUpdateMetadata={library.updateClipMetadata}
          onUpdateTrim={library.updateClipTrimRange}
        />
        <StitchrCallout />
      </div>
    </DashboardShell>
  );
}
