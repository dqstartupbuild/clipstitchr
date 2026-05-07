"use client";

import { useMemo, useState } from "react";
import { CreatedVideosSection } from "@/app/_components/dashboard/CreatedVideosSection";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { LibraryPageHeader } from "@/app/_components/dashboard/LibraryPageHeader";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import { useClipLibrary } from "@/lib/clipr/hooks/useClipLibrary";
import { filterCreatedVideosByName } from "@/lib/clipr/utils/filterCreatedVideosByName";

export function CreatedVideosPageClient() {
  const library = useClipLibrary();
  const [searchQuery, setSearchQuery] = useState("");
  const createdVideos = useMemo(
    () => filterCreatedVideosByName(library.createdVideos, searchQuery),
    [library.createdVideos, searchQuery],
  );
  const hasSearchQuery = searchQuery.trim().length > 0;

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
        <div className="flex justify-end">
          <SearchInput
            label="Search created videos"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search created videos"
            className="w-full sm:max-w-sm"
          />
        </div>
        <CreatedVideosSection
          createdVideos={createdVideos}
          emptyTitle={hasSearchQuery ? "No matching videos" : undefined}
          emptyDescription={
            hasSearchQuery
              ? "No created videos match that name."
              : undefined
          }
          onDelete={library.removeCreatedVideo}
        />
      </div>
    </DashboardShell>
  );
}
