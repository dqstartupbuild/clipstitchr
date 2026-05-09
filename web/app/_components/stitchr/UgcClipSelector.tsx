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
  onEditTrim: (clip: VideoClipMetadata) => void;
};

export function UgcClipSelector({
  clips,
  selectedIds,
  selectedTrimRangesByClipId,
  onLoadClip,
  onSelect,
  onEditTrim,
}: UgcClipSelectorProps) {
  const pagination = usePagination(clips, {
    pageSize: clipSelectorPageSize,
  });

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-base font-bold text-text-primary">UGC Clips</h2>
        <p className="text-xs font-semibold text-text-tertiary">
          {selectedIds.length}/{maxStitchrUgcSelectionCount}
        </p>
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {pagination.pageItems.length ? (
          pagination.pageItems.map((clip) => {
            const isSelected = selectedIds.includes(clip.id);

            return (
              <SelectableClipCard
                key={clip.id}
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
                onEditTrim={onEditTrim}
              />
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
