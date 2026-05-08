"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { VideoClipCard } from "@/app/_components/dashboard/VideoClipCard";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { uploadLibraryPageSize } from "@/lib/clipstitchr/constants/uploadLibraryPageSize";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

type VideoLibrarySectionProps = {
  id: string;
  title: string;
  clips: VideoClipMetadata[];
  emptyDescription: string;
  emptyTitle?: string;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onDelete: (id: string) => void | Promise<void>;
  onUpdateMetadata: (
    clip: VideoClipMetadata,
    metadata: AssetMetadataUpdate,
  ) => void | Promise<void>;
  onUpdateTrim: (
    clip: VideoClipMetadata,
    trimRange: VideoTrimRange,
  ) => void | Promise<void>;
};

export function VideoLibrarySection({
  id,
  title,
  clips,
  emptyDescription,
  emptyTitle = "No videos yet",
  onLoadClip,
  onDelete,
  onUpdateMetadata,
  onUpdateTrim,
}: VideoLibrarySectionProps) {
  const pagination = usePagination(clips, {
    pageSize: uploadLibraryPageSize,
  });

  return (
    <section id={id}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
        <span className="text-sm font-semibold text-text-tertiary">
          {clips.length}
        </span>
      </div>
      {clips.length ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {pagination.pageItems.map((clip) => (
              <VideoClipCard
                key={clip.id}
                clip={clip}
                onLoadClip={onLoadClip}
                onDelete={onDelete}
                onUpdateMetadata={onUpdateMetadata}
                onUpdateTrim={onUpdateTrim}
              />
            ))}
          </div>
          {pagination.totalPages > 1 ? (
            <PaginationControls
              canGoNext={pagination.canGoNext}
              canGoPrevious={pagination.canGoPrevious}
              currentPage={pagination.currentPage}
              totalItems={pagination.totalItems}
              totalPages={pagination.totalPages}
              visibleEnd={pagination.visibleEnd}
              visibleStart={pagination.visibleStart}
              onNext={pagination.goToNextPage}
              onPrevious={pagination.goToPreviousPage}
            />
          ) : null}
        </>
      ) : (
        <DashboardEmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </section>
  );
}
