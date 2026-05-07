"use client";

import { SelectableClipRow } from "@/app/_components/create/SelectableClipRow";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { clipSelectorPageSize } from "@/lib/clipr/constants/clipSelectorPageSize";
import { usePagination } from "@/lib/clipr/hooks/usePagination";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";
import type { VideoTrimRange } from "@/lib/clipr/types/VideoTrimRange";
import { getDefaultVideoTrimRange } from "@/lib/clipr/utils/getDefaultVideoTrimRange";

type DemoClipSelectorProps = {
  clips: VideoClip[];
  selectedId: string | null;
  selectedTrimRange: VideoTrimRange | null;
  onSelect: (id: string) => void;
  onEditTrim: (clip: VideoClip) => void;
};

export function DemoClipSelector({
  clips,
  selectedId,
  selectedTrimRange,
  onSelect,
  onEditTrim,
}: DemoClipSelectorProps) {
  const pagination = usePagination(clips, {
    pageSize: clipSelectorPageSize,
  });

  return (
    <div>
      <h2 className="text-base font-bold text-text-primary">Demo Video</h2>
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
            No demo videos match this search.
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
