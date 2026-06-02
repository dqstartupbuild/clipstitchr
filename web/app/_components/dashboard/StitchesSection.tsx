"use client";

import { useMemo } from "react";
import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { LibraryBatchActionBar } from "@/app/_components/dashboard/LibraryBatchActionBar";
import { StitchCard } from "@/app/_components/dashboard/StitchCard";
import { Button } from "@/app/_components/ui/Button";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { uploadLibraryPageSize } from "@/lib/clipstitchr/constants/uploadLibraryPageSize";
import { useLibraryBatchDelete } from "@/lib/clipstitchr/hooks/useLibraryBatchDelete";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

type StitchesSectionProps = {
  stitches: Stitch[];
  emptyDescription?: string;
  emptyTitle?: string;
  hasMoreItems?: boolean;
  id?: string;
  isLoadingMoreItems?: boolean;
  title?: string;
  totalCount?: number;
  onDelete: (id: string) => void | Promise<void>;
  onGenerateMusic: (stitch: Stitch) => Promise<StitchMusicMetadata | null>;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onLoadMoreItems?: () => void;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onUpdateMusic: (
    stitch: Stitch,
    music: StitchMusicMetadata | null,
  ) => void | Promise<void>;
  onUpdateTextOverlay: (
    stitch: Stitch,
    textOverlay: TextOverlay | TextOverlay[] | null,
  ) => void | Promise<void>;
};

export function StitchesSection({
  stitches,
  emptyDescription = "Stitch a video after you have at least one UGC and one demo video.",
  emptyTitle = "No stitches yet",
  hasMoreItems = false,
  id = "stitches",
  isLoadingMoreItems = false,
  title = "Stitches",
  totalCount,
  onDelete,
  onGenerateMusic,
  onLoadClip,
  onLoadMoreItems,
  onLoadPoster,
  onUpdateMusic,
  onUpdateTextOverlay,
}: StitchesSectionProps) {
  const pagination = usePagination(stitches, {
    pageSize: uploadLibraryPageSize,
  });
  const pageItemIds = useMemo(
    () => pagination.pageItems.map((stitch) => stitch.id),
    [pagination.pageItems],
  );
  const batchDelete = useLibraryBatchDelete({
    itemIds: pageItemIds,
    itemName: "stitch",
    itemPluralName: "stitches",
    onDelete,
  });

  return (
    <section id={id}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          <span className="text-sm font-semibold text-text-tertiary">
            {totalCount ?? stitches.length}
          </span>
        </div>
        {stitches.length ? (
          <LibraryBatchActionBar
            areAllVisibleItemsSelected={batchDelete.areAllVisibleItemsSelected}
            isDeletingSelected={batchDelete.isDeletingSelected}
            isSelecting={batchDelete.isSelecting}
            selectedCount={batchDelete.selectedCount}
            visibleItemCount={batchDelete.visibleItemCount}
            onClearSelection={batchDelete.clearSelection}
            onDeleteSelected={() => {
              void batchDelete.deleteSelectedItems();
            }}
            onSelectVisible={batchDelete.selectVisibleItems}
            onStartSelecting={batchDelete.startSelecting}
            onStopSelecting={batchDelete.stopSelecting}
          />
        ) : null}
      </div>
      {stitches.length ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {pagination.pageItems.map((stitch) => (
              <StitchCard
                key={stitch.id}
                stitch={stitch}
                isSelected={batchDelete.selectedIds.has(stitch.id)}
                isSelectionDisabled={batchDelete.isDeletingSelected}
                onDelete={onDelete}
                onGenerateMusic={onGenerateMusic}
                onLoadClip={onLoadClip}
                onLoadPoster={onLoadPoster}
                onSelect={
                  batchDelete.isSelecting
                    ? () => batchDelete.toggleItemSelection(stitch.id)
                    : undefined
                }
                onUpdateMusic={onUpdateMusic}
                onUpdateTextOverlay={onUpdateTextOverlay}
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
        <DashboardEmptyState
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
      {hasMoreItems && onLoadMoreItems ? (
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="secondary"
            isLoading={isLoadingMoreItems}
            onClick={onLoadMoreItems}
          >
            Load more stitches
          </Button>
        </div>
      ) : null}
    </section>
  );
}
