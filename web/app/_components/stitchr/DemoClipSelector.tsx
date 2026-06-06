"use client";

import { useMemo } from "react";
import { SelectableClipCard } from "@/app/_components/stitchr/SelectableClipCard";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { clipSelectorPageSize } from "@/lib/clipstitchr/constants/clipSelectorPageSize";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";

type DemoClipSelectorProps = {
  clips: VideoClipMetadata[];
  products: ProductProfile[];
  selectionMode?: "single" | "multiple";
  selectedId: string | null;
  selectedIds?: string[];
  selectedTrimRange: VideoTrimRange | null;
  selectedTrimRangesByClipId?: Record<string, VideoTrimRange>;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onSelect: (id: string) => void;
  onUpdateTrim: (clip: VideoClipMetadata, trimRange: VideoTrimRange) => void;
};

export function DemoClipSelector({
  clips,
  products,
  selectionMode = "single",
  selectedId,
  selectedIds = [],
  selectedTrimRange,
  selectedTrimRangesByClipId = {},
  onLoadClip,
  onLoadPoster,
  onSelect,
  onUpdateTrim,
}: DemoClipSelectorProps) {
  const productNamesById = useMemo(
    () => new Map(products.map((product) => [product.id, product.name])),
    [products],
  );
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
          <p className="text-sm font-semibold text-accent-dark">Product demo</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Pick the proof
          </h2>
        </div>
      </div>
      {clips.length ? (
        <>
          <div className="mt-3 flex max-w-full gap-3 overflow-x-auto pb-1">
            {pagination.pageItems.map((clip) => (
              <div key={clip.id} className="w-44 shrink-0">
                <SelectableClipCard
                  clip={clip}
                  productName={
                    clip.productId
                      ? productNamesById.get(clip.productId)
                      : undefined
                  }
                  trimRange={
                    selectionMode === "multiple"
                      ? (selectedTrimRangesByClipId[clip.id] ??
                        getDefaultVideoTrimRange(clip))
                      : clip.id === selectedId && selectedTrimRange
                        ? selectedTrimRange
                        : getDefaultVideoTrimRange(clip)
                  }
                  isSelected={
                    selectionMode === "multiple"
                      ? selectedIds.includes(clip.id)
                      : clip.id === selectedId
                  }
                  onLoadClip={onLoadClip}
                  onLoadPoster={onLoadPoster}
                  onSelect={onSelect}
                  onUpdateTrim={onUpdateTrim}
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
        <p className="mt-3 rounded-lg border border-dashed border-border bg-slate-50 p-4 text-sm font-semibold text-text-tertiary">
          No demo videos match this search.
        </p>
      )}
    </section>
  );
}
