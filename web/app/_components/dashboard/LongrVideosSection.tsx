"use client";

import { useMemo } from "react";
import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { LibraryBatchActionBar } from "@/app/_components/dashboard/LibraryBatchActionBar";
import { LongrVideoCard } from "@/app/_components/dashboard/LongrVideoCard";
import { Button } from "@/app/_components/ui/Button";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { uploadLibraryPageSize } from "@/lib/clipstitchr/constants/uploadLibraryPageSize";
import { useLibraryBatchDelete } from "@/lib/clipstitchr/hooks/useLibraryBatchDelete";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { LongrVideo } from "@/lib/clipstitchr/types/LongrVideo";
import type { LongrVideoMetadata } from "@/lib/clipstitchr/types/LongrVideoMetadata";

type LongrVideosSectionProps = {
  emptyDescription?: string;
  emptyTitle?: string;
  hasMoreItems?: boolean;
  id?: string;
  isLoadingMoreItems?: boolean;
  longrVideos: LongrVideoMetadata[];
  onDelete: (id: string) => void | Promise<void>;
  onLoadLongrVideo: (id: string) => Promise<LongrVideo | null>;
  onLoadMoreItems?: () => void;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  title?: string;
  totalCount?: number;
};

export function LongrVideosSection({
  emptyDescription = "Build a long-form video from Longr to save it here.",
  emptyTitle = "No Longs yet",
  hasMoreItems = false,
  id = "longr",
  isLoadingMoreItems = false,
  longrVideos,
  onDelete,
  onLoadLongrVideo,
  onLoadMoreItems,
  onLoadPoster,
  title = "Longs",
  totalCount,
}: LongrVideosSectionProps) {
  const pagination = usePagination(longrVideos, {
    pageSize: uploadLibraryPageSize,
  });
  const pageItemIds = useMemo(
    () => pagination.pageItems.map((longrVideo) => longrVideo.id),
    [pagination.pageItems],
  );
  const batchDelete = useLibraryBatchDelete({
    itemIds: pageItemIds,
    itemName: "Long",
    itemPluralName: "Longs",
    onDelete,
  });

  return (
    <section id={id}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          <span className="text-sm font-semibold text-text-tertiary">
            {totalCount ?? longrVideos.length}
          </span>
        </div>
        {longrVideos.length ? (
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
      {longrVideos.length ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {pagination.pageItems.map((longrVideo) => (
              <LongrVideoCard
                key={longrVideo.id}
                longrVideo={longrVideo}
                isSelected={batchDelete.selectedIds.has(longrVideo.id)}
                isSelectionDisabled={batchDelete.isDeletingSelected}
                onDelete={onDelete}
                onLoadLongrVideo={onLoadLongrVideo}
                onLoadPoster={onLoadPoster}
                onSelect={
                  batchDelete.isSelecting
                    ? () => batchDelete.toggleItemSelection(longrVideo.id)
                    : undefined
                }
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
            Load more Longs
          </Button>
        </div>
      ) : null}
    </section>
  );
}
