"use client";

import { useMemo } from "react";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { LibraryPageHeader } from "@/app/_components/dashboard/LibraryPageHeader";
import { VideoLibrarySection } from "@/app/_components/dashboard/VideoLibrarySection";
import { useClipLibrary } from "@/lib/clipr/hooks/useClipLibrary";
import type { ClipType } from "@/lib/clipr/types/ClipType";
import { filterClipsByType } from "@/lib/clipr/utils/filterClipsByType";

type VideoClipsPageClientProps = {
  clipType: ClipType;
  eyebrow: string;
  title: string;
  description: string;
  emptyDescription: string;
  sectionId: string;
};

export function VideoClipsPageClient({
  clipType,
  eyebrow,
  title,
  description,
  emptyDescription,
  sectionId,
}: VideoClipsPageClientProps) {
  const library = useClipLibrary();
  const clips = useMemo(
    () => filterClipsByType(library.clips, clipType),
    [clipType, library.clips],
  );

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <LibraryPageHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        {library.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {library.error}
          </div>
        ) : null}
        <VideoLibrarySection
          id={sectionId}
          title={title}
          clips={clips}
          emptyDescription={emptyDescription}
          onDelete={library.removeClip}
          onRename={library.renameClip}
        />
      </div>
    </DashboardShell>
  );
}
