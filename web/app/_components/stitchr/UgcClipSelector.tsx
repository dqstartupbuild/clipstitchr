"use client";

import { SelectableClipCard } from "@/app/_components/stitchr/SelectableClipCard";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { clipSelectorPageSize } from "@/lib/clipstitchr/constants/clipSelectorPageSize";
import { maxStitchrUgcSelectionCount } from "@/lib/clipstitchr/constants/maxStitchrUgcSelectionCount";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";

type UgcClipSelectorProps = {
  clips: VideoClipMetadata[];
  selectedIds: string[];
  selectedTrimRangesByClipId: Record<string, VideoTrimRange>;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onSelect: (id: string) => void;
  onUpdateTrim: (clip: VideoClipMetadata, trimRange: VideoTrimRange) => void;
};

export function UgcClipSelector({
  clips,
  selectedIds,
  selectedTrimRangesByClipId,
  onLoadClip,
  onSelect,
  onUpdateTrim,
}: UgcClipSelectorProps) {
  const pagination = usePagination(clips, {
    pageSize: clipSelectorPageSize,
  });

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
            A
          </span>
          <div>
            <p className="text-sm font-semibold text-accent-dark">UGC clips</p>
            <h2 className="mt-0.5 text-base font-bold text-text-primary">
              Pick hooks
            </h2>
          </div>
        </div>
        <p className="pt-1 text-xs font-semibold text-text-tertiary">
          {selectedIds.length}/{maxStitchrUgcSelectionCount}
        </p>
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
        {pagination.pageItems.length ? (
          pagination.pageItems.map((clip) => {
            const isSelected = selectedIds.includes(clip.id);

            return (
              <div key={clip.id} className="w-44 shrink-0">
                <SelectableClipCard
                  clip={clip}
                  trimRange={
                    isSelected
                      ? (selectedTrimRangesByClipId[clip.id] ??
                        getDefaultVideoTrimRange(clip))
                      : getDefaultVideoTrimRange(clip)
                  }
                  isSelected={isSelected}
                  isSelectionDisabled={
                    selectedIds.length >= maxStitchrUgcSelectionCount &&
                    !isSelected
                  }
                  onLoadClip={onLoadClip}
                  onSelect={onSelect}
                  onUpdateTrim={onUpdateTrim}
                />
              </div>
            );
          })
        ) : (
          <p className="rounded-lg border border-dashed border-border bg-slate-50 p-4 text-sm font-semibold text-text-tertiary">
            No UGC clips match this search.
          </p>
        )}
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
    </div>
  );
}
