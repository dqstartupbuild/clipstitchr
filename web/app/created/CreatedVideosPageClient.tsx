"use client";

import { CreatedVideosSection } from "@/app/_components/dashboard/CreatedVideosSection";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { LibraryPageHeader } from "@/app/_components/dashboard/LibraryPageHeader";
import { useClipLibrary } from "@/lib/clipr/hooks/useClipLibrary";

export function CreatedVideosPageClient() {
  const library = useClipLibrary();

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <LibraryPageHeader
          eyebrow="Exports"
          title="Created Videos"
          description="Browse stitched UGC-first videos saved in this browser."
        />
        {library.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {library.error}
          </div>
        ) : null}
        <CreatedVideosSection
          createdVideos={library.createdVideos}
          onDelete={library.removeCreatedVideo}
        />
      </div>
    </DashboardShell>
  );
}
