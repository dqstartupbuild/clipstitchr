"use client";

import { SelectableClipRow } from "@/app/_components/create/SelectableClipRow";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { clipSelectorPageSize } from "@/lib/clipr/constants/clipSelectorPageSize";
import { usePagination } from "@/lib/clipr/hooks/usePagination";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";

type DemoClipSelectorProps = {
  clips: VideoClip[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function DemoClipSelector({
  clips,
  selectedId,
  onSelect,
}: DemoClipSelectorProps) {
  const pagination = usePagination(clips, {
    pageSize: clipSelectorPageSize,
  });

  return (
    <div>
      <h2 className="text-base font-bold text-text-primary">Demo Video</h2>
      <div className="mt-3 space-y-2">
        {pagination.pageItems.map((clip) => (
          <SelectableClipRow
            key={clip.id}
            clip={clip}
            isSelected={clip.id === selectedId}
            onSelect={onSelect}
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
    </div>
  );
}
