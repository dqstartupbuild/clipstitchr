"use client";

import { SelectableClipRow } from "@/app/_components/stitchr/SelectableClipRow";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { clipSelectorPageSize } from "@/lib/clipstitchr/constants/clipSelectorPageSize";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";

type UgcClipSelectorProps = {
  clips: VideoClipMetadata[];
  selectedId: string | null;
  selectedTrimRange: VideoTrimRange | null;
  onSelect: (id: string) => void;
  onEditTrim: (clip: VideoClipMetadata) => void;
};

export function UgcClipSelector({
  clips,
  selectedId,
  selectedTrimRange,
  onSelect,
  onEditTrim,
}: UgcClipSelectorProps) {
  const pagination = usePagination(clips, {
    pageSize: clipSelectorPageSize,
  });

  return (
    <div>
      <h2 className="text-base font-bold text-text-primary">UGC Clip</h2>
      <div className="mt-3 space-y-2">
        {pagination.pageItems.length ? (
          pagination.pageItems.map((clip) => (
            <SelectableClipRow
              key={clip.id}
              clip={clip}
              trimRange={
                clip.id === selectedId && selectedTrimRange
                  ? selectedTrimRange
                  : getDefaultVideoTrimRange(clip)
              }
              isSelected={clip.id === selectedId}
              onSelect={onSelect}
              onEditTrim={onEditTrim}
            />
          ))
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
