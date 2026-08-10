"use client";

import { useMemo } from "react";
import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { LibraryBatchActionBar } from "@/app/_components/dashboard/LibraryBatchActionBar";
import { SwiprSwipeCard } from "@/app/_components/dashboard/SwiprSwipeCard";
import { SocialPublishingBatchQueueDialog } from "@/app/_components/socialPublishing/SocialPublishingBatchQueueDialog";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { StatusFilterTabs } from "@/app/_components/ui/StatusFilterTabs";
import { createSwiprSocialPublishingScheduleMedia } from "@/lib/clipstitchr/client/createSwiprSocialPublishingScheduleMedia";
import { uploadLibraryPageSize } from "@/lib/clipstitchr/constants/uploadLibraryPageSize";
import { useLibraryBatchDelete } from "@/lib/clipstitchr/hooks/useLibraryBatchDelete";
import { useLibraryBatchQueueDialog } from "@/lib/clipstitchr/hooks/useLibraryBatchQueueDialog";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { LibraryPostedStatusFilter } from "@/lib/clipstitchr/types/LibraryPostedStatusFilter";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import { createSwiprSwipeSocialDescription } from "@/lib/clipstitchr/utils/createSwiprSwipeSocialDescription";
import { getSwiprSocialPublishingTitle } from "@/lib/clipstitchr/utils/getSwiprSocialPublishingTitle";

type SwiprSwipesSectionProps = {
  backgrounds: SwiprBackgroundAsset[];
  emptyDescription?: string;
  emptyTitle?: string;
  id?: string;
  statusCounts?: Record<LibraryPostedStatusFilter, number>;
  statusFilter?: LibraryPostedStatusFilter;
  swipes: SwiprSwipe[];
  title?: string;
  onLoadBackgroundBlob: (id: string) => Promise<Blob>;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onDelete: (id: string) => void | Promise<void>;
  onSocialPublishingScheduled?: () => void | Promise<void>;
  onStatusFilterChange?: (status: LibraryPostedStatusFilter) => void;
  onUpdatePostedStatus?: (
    swipe: SwiprSwipe,
    isPosted: boolean,
  ) => void | Promise<void>;
};

export function SwiprSwipesSection({
  backgrounds,
  emptyDescription = "Save a Swipe from Swipr when slides fit the idea better than another video.",
  emptyTitle = "No carousel drafts yet",
  id = "swipes",
  statusCounts,
  statusFilter = "active",
  swipes,
  title = "Swipes",
  onLoadBackgroundBlob,
  onLoadPoster,
  onDelete,
  onSocialPublishingScheduled,
  onStatusFilterChange,
  onUpdatePostedStatus,
}: SwiprSwipesSectionProps) {
  const backgroundsById = useMemo(
    () => new Map(backgrounds.map((background) => [background.id, background])),
    [backgrounds],
  );
  const pagination = usePagination(swipes, {
    pageSize: uploadLibraryPageSize,
  });
  const pageItemIds = useMemo(
    () => pagination.pageItems.map((swipe) => swipe.id),
    [pagination.pageItems],
  );
  const batchDelete = useLibraryBatchDelete({
    itemIds: pageItemIds,
    itemName: "Swipe",
    itemPluralName: "Swipes",
    onDelete,
  });
  const selectedSwipes = useMemo(
    () => swipes.filter((swipe) => batchDelete.selectedIds.has(swipe.id)),
    [batchDelete.selectedIds, swipes],
  );
  const batchQueue = useLibraryBatchQueueDialog(selectedSwipes);
  const statusFilterOptions: {
    label: string;
    value: LibraryPostedStatusFilter;
  }[] = [
    { label: "Active", value: "active" },
    { label: "Posted", value: "posted" },
    { label: "All", value: "all" },
  ];

  return (
    <section id={id}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          <span className="text-sm font-semibold text-text-tertiary">
            {swipes.length}
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          {onStatusFilterChange ? (
            <StatusFilterTabs
              ariaLabel={`${title} status filter`}
              counts={statusCounts}
              options={statusFilterOptions}
              value={statusFilter}
              onChange={onStatusFilterChange}
            />
          ) : null}
          {swipes.length ? (
            <LibraryBatchActionBar
              areAllVisibleItemsSelected={batchDelete.areAllVisibleItemsSelected}
              isDeletingSelected={batchDelete.isDeletingSelected}
              isQueueingSelected={batchQueue.isBatchQueueDialogOpen}
              isSelecting={batchDelete.isSelecting}
              selectedCount={batchDelete.selectedCount}
              visibleItemCount={batchDelete.visibleItemCount}
              onClearSelection={batchDelete.clearSelection}
              onDeleteSelected={() => {
                void batchDelete.deleteSelectedItems();
              }}
              onQueueSelected={() => {
                batchQueue.openBatchQueueDialog();
              }}
              onSelectVisible={batchDelete.selectVisibleItems}
              onStartSelecting={batchDelete.startSelecting}
              onStopSelecting={batchDelete.stopSelecting}
            />
          ) : null}
        </div>
      </div>
      {swipes.length ? (
        <>
          <div className="grid justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {pagination.pageItems.map((swipe) => {
              return (
                <SwiprSwipeCard
                  key={swipe.id}
                  background={backgroundsById.get(swipe.backgroundId)}
                  backgrounds={backgrounds}
                  swipe={swipe}
                  isSelected={batchDelete.selectedIds.has(swipe.id)}
                  isSelectionDisabled={
                    batchDelete.isDeletingSelected ||
                    batchQueue.isBatchQueueDialogOpen
                  }
                  onLoadBackgroundBlob={onLoadBackgroundBlob}
                  onLoadPoster={onLoadPoster}
                  onDelete={onDelete}
                  onSocialPublishingScheduled={onSocialPublishingScheduled}
                  onSelect={
                    batchDelete.isSelecting
                      ? () => batchDelete.toggleItemSelection(swipe.id)
                      : undefined
                  }
                  onUpdatePostedStatus={onUpdatePostedStatus}
                />
              );
            })}
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
      {batchQueue.isBatchQueueDialogOpen ? (
        <SocialPublishingBatchQueueDialog
          allowMusic
          items={batchQueue.queuedItems.map((swipe) => ({
            caption:
              swipe.socialCaption ?? createSwiprSwipeSocialDescription(swipe),
            id: swipe.id,
            productId: swipe.productSourceId,
            renderMedia: ({ musicTrack, onProgress, platforms }) =>
              createSwiprSocialPublishingScheduleMedia({
                backgroundsById,
                loadBackgroundBlob: onLoadBackgroundBlob,
                musicTrack,
                onProgress,
                platforms,
                swipe,
              }),
            sourceType: "swipe",
            title: getSwiprSocialPublishingTitle(swipe),
          }))}
          onClose={batchQueue.closeBatchQueueDialog}
          onQueued={async () => {
            batchDelete.stopSelecting();
            await onSocialPublishingScheduled?.();
          }}
        />
      ) : null}
    </section>
  );
}
