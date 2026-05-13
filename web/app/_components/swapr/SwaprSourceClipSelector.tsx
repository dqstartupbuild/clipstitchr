"use client";

import Link from "next/link";
import { SwaprSourceClipCard } from "@/app/_components/swapr/SwaprSourceClipCard";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { clipSelectorPageSize } from "@/lib/clipstitchr/constants/clipSelectorPageSize";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type SwaprSourceClipSelectorProps = {
  clips: VideoClipMetadata[];
  selectedClipId?: string;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onSelect: (clip: VideoClipMetadata) => void;
};

export function SwaprSourceClipSelector({
  clips,
  selectedClipId,
  onLoadClip,
  onSelect,
}: SwaprSourceClipSelectorProps) {
  const pagination = usePagination(clips, {
    pageSize: clipSelectorPageSize,
  });

  return (
    <section className="min-w-0">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
          B
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">UGC</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Pick the motion
          </h2>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Pick the video you want to swap.
          </p>
        </div>
      </div>

      {clips.length ? (
        <>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
            {pagination.pageItems.map((clip) => (
              <div key={clip.id} className="w-40 shrink-0">
                <SwaprSourceClipCard
                  clip={clip}
                  isSelected={clip.id === selectedClipId}
                  onLoadClip={onLoadClip}
                  onSelect={onSelect}
                />
              </div>
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
        <div className="mt-3 rounded-lg border border-border bg-surface-elevated p-4">
          <h3 className="text-sm font-bold text-text-primary">
            No source videos yet
          </h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Upload UGC or create a stitch before using Swapr.
          </p>
          <Link
            href="/dashboard/uploads?tab=ugc&upload=open#upload-panel"
            className="btn-secondary mt-4"
          >
            Upload Video
          </Link>
        </div>
      )}
    </section>
  );
}
