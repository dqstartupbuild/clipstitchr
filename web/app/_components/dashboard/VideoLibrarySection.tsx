"use client";

import { useMemo } from "react";
import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { LibraryBatchActionBar } from "@/app/_components/dashboard/LibraryBatchActionBar";
import { VideoClipCard } from "@/app/_components/dashboard/VideoClipCard";
import { Button } from "@/app/_components/ui/Button";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { uploadLibraryPageSize } from "@/lib/clipstitchr/constants/uploadLibraryPageSize";
import { useLibraryBatchDelete } from "@/lib/clipstitchr/hooks/useLibraryBatchDelete";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { ClipPerformanceScore } from "@/lib/clipstitchr/types/ClipPerformanceScore";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";
import type { CreateAvatarFromUgcClipOptions } from "@/lib/clipstitchr/types/CreateAvatarFromUgcClipOptions";
import type { LibraryPostedStatusFilter } from "@/lib/clipstitchr/types/LibraryPostedStatusFilter";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

type VideoLibrarySectionProps = {
  id: string;
  title: string;
  clips: VideoClipMetadata[];
  products?: ProductProfile[];
  avatarCreatorError?: string | null;
  emptyDescription: string;
  emptyTitle?: string;
  hasMoreItems?: boolean;
  isCreatingAvatarFromClip?: boolean;
  isLoadingMoreItems?: boolean;
  loadMoreLabel?: string;
  statusCounts?: Record<LibraryPostedStatusFilter, number>;
  statusFilter?: LibraryPostedStatusFilter;
  totalCount?: number;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onDelete: (id: string) => void | Promise<void>;
  onUpdateMetadata: (
    clip: VideoClipMetadata,
    metadata: AssetMetadataUpdate,
  ) => void | Promise<void>;
  onGenerateCliprMusic?: (
    clip: VideoClipMetadata,
  ) => Promise<CliprMusicMetadata | null>;
  onScoreClip?: (clip: VideoClipMetadata) => Promise<ClipPerformanceScore>;
  onApplyQuickEdit?: (clip: VideoClipMetadata) => Promise<void>;
  onResetQuickEdit?: (clip: VideoClipMetadata) => Promise<void>;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onLoadMoreItems?: () => void;
  onStatusFilterChange?: (status: LibraryPostedStatusFilter) => void;
  onUpdateCliprMusic?: (
    clip: VideoClipMetadata,
    music: CliprMusicMetadata | null,
  ) => void | Promise<void>;
  onUpdateTrim: (
    clip: VideoClipMetadata,
    trimRange: VideoTrimRange,
  ) => void | Promise<void>;
  onUpdatePostedStatus?: (
    clip: VideoClipMetadata,
    isPosted: boolean,
  ) => void | Promise<void>;
  onCreateAvatarFromClip?: (
    clip: VideoClipMetadata,
    options: CreateAvatarFromUgcClipOptions,
  ) => Promise<boolean>;
};

export function VideoLibrarySection({
  id,
  title,
  clips,
  products = [],
  avatarCreatorError = null,
  emptyDescription,
  emptyTitle = "No videos yet",
  hasMoreItems = false,
  isCreatingAvatarFromClip = false,
  isLoadingMoreItems = false,
  loadMoreLabel = "Load more videos",
  statusCounts,
  statusFilter = "active",
  totalCount,
  onLoadClip,
  onLoadPoster,
  onDelete,
  onGenerateCliprMusic,
  onScoreClip,
  onApplyQuickEdit,
  onResetQuickEdit,
  onLoadMoreItems,
  onStatusFilterChange,
  onUpdateCliprMusic,
  onUpdateMetadata,
  onUpdateTrim,
  onUpdatePostedStatus,
  onCreateAvatarFromClip,
}: VideoLibrarySectionProps) {
  const productNamesById = useMemo(
    () => new Map(products.map((product) => [product.id, product.name])),
    [products],
  );
  const pagination = usePagination(clips, {
    pageSize: uploadLibraryPageSize,
  });
  const pageItemIds = useMemo(
    () => pagination.pageItems.map((clip) => clip.id),
    [pagination.pageItems],
  );
  const batchDelete = useLibraryBatchDelete({
    itemIds: pageItemIds,
    itemName: "video",
    itemPluralName: "videos",
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
            {totalCount ?? clips.length}
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
          {clips.length ? (
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
      {clips.length ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {pagination.pageItems.map((clip) => (
              <VideoClipCard
                key={clip.id}
                clip={clip}
                products={products}
                productName={
                  clip.productId ? productNamesById.get(clip.productId) : undefined
                }
                avatarCreatorError={avatarCreatorError}
                isSelected={batchDelete.selectedIds.has(clip.id)}
                isSelectionDisabled={batchDelete.isDeletingSelected}
                isCreatingAvatarFromClip={isCreatingAvatarFromClip}
                onLoadClip={onLoadClip}
                onLoadPoster={onLoadPoster}
                onDelete={onDelete}
                onSelect={
                  batchDelete.isSelecting
                    ? () => batchDelete.toggleItemSelection(clip.id)
                    : undefined
                }
                onGenerateCliprMusic={onGenerateCliprMusic}
                onScore={onScoreClip}
                onApplyQuickEdit={onApplyQuickEdit}
                onResetQuickEdit={onResetQuickEdit}
                onUpdateCliprMusic={onUpdateCliprMusic}
                onUpdateMetadata={onUpdateMetadata}
                onUpdateTrim={onUpdateTrim}
                onUpdatePostedStatus={onUpdatePostedStatus}
                onCreateAvatarFromClip={onCreateAvatarFromClip}
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
        <DashboardEmptyState title={emptyTitle} description={emptyDescription} />
      )}
      {hasMoreItems && onLoadMoreItems ? (
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="secondary"
            isLoading={isLoadingMoreItems}
            onClick={onLoadMoreItems}
          >
            {loadMoreLabel}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
