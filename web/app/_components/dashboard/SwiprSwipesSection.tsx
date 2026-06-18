"use client";

import { useMemo } from "react";
import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { LibraryBatchActionBar } from "@/app/_components/dashboard/LibraryBatchActionBar";
import { SwiprSwipeCard } from "@/app/_components/dashboard/SwiprSwipeCard";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { uploadLibraryPageSize } from "@/lib/clipstitchr/constants/uploadLibraryPageSize";
import { useLibraryBatchDelete } from "@/lib/clipstitchr/hooks/useLibraryBatchDelete";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { LibraryPostedStatusFilter } from "@/lib/clipstitchr/types/LibraryPostedStatusFilter";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";

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
  onStatusFilterChange?: (status: LibraryPostedStatusFilter) => void;
  onUpdatePostedStatus?: (
    swipe: SwiprSwipe,
    isPosted: boolean,
  ) => void | Promise<void>;
};

export function SwiprSwipesSection({
  backgrounds,
  emptyDescription = "Save a carousel from Swipr to reuse and download it later.",
  emptyTitle = "No Swipes yet",
  id = "swipes",
  statusCounts,
  statusFilter = "active",
  swipes,
  title = "Swipes",
  onLoadBackgroundBlob,
  onLoadPoster,
  onDelete,
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
            <div
              className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-slate-100 p-1"
              aria-label={`${title} status filter`}
            >
              {statusFilterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onStatusFilterChange(option.value)}
                  className={[
                    "h-8 rounded-md px-3 text-sm font-semibold transition-colors",
                    statusFilter === option.value
                      ? "bg-white text-accent shadow-sm"
                      : "text-text-secondary hover:text-text-primary",
                  ].join(" ")}
                >
                  {option.label}
                  {statusCounts ? (
                    <span className="ml-1 text-xs text-text-tertiary">
                      {statusCounts[option.value]}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
          {swipes.length ? (
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
                  isSelectionDisabled={batchDelete.isDeletingSelected}
                  onLoadBackgroundBlob={onLoadBackgroundBlob}
                  onLoadPoster={onLoadPoster}
                  onDelete={onDelete}
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
    </section>
  );
}
