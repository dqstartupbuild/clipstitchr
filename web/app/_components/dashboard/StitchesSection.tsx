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
import type { StitchLibraryStatusFilter } from "@/lib/clipstitchr/types/StitchLibraryStatusFilter";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";
import type { StitchSourceSettingsUpdate } from "@/lib/clipstitchr/types/StitchSourceSettingsUpdate";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type StitchesSectionProps = {
  demoClips: VideoClipMetadata[];
  stitches: Stitch[];
  emptyDescription?: string;
  emptyTitle?: string;
  hasMoreItems?: boolean;
  id?: string;
  isLoadingMoreItems?: boolean;
  savingTemplateStitchId?: string | null;
  statusCounts?: Record<StitchLibraryStatusFilter, number>;
  statusFilter?: StitchLibraryStatusFilter;
  title?: string;
  totalCount?: number;
  onDelete: (id: string) => void | Promise<void>;
  onGenerateMusic: (stitch: Stitch) => Promise<StitchMusicMetadata | null>;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onLoadMoreItems?: () => void;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onSaveTemplate?: (stitch: Stitch) => void | Promise<unknown>;
  onStatusFilterChange?: (status: StitchLibraryStatusFilter) => void;
  onUpdateMusic: (
    stitch: Stitch,
    music: StitchMusicMetadata | null,
  ) => void | Promise<void>;
  onUpdatePostedStatus: (
    stitch: Stitch,
    isPosted: boolean,
  ) => void | Promise<void>;
  onUpdateSourceSettings: (
    stitch: Stitch,
    update: StitchSourceSettingsUpdate,
  ) => void | Promise<void>;
  onUpdateTextOverlay: (
    stitch: Stitch,
    textOverlay: TextOverlay | TextOverlay[] | null,
  ) => void | Promise<void>;
  ugcClips: VideoClipMetadata[];
};

export function StitchesSection({
  demoClips,
  stitches,
  emptyDescription = "Stitch a video after you have at least one UGC and one demo video.",
  emptyTitle = "No stitches yet",
  hasMoreItems = false,
  id = "stitches",
  isLoadingMoreItems = false,
  savingTemplateStitchId = null,
  statusCounts,
  statusFilter = "active",
  title = "Stitches",
  totalCount,
  onDelete,
  onGenerateMusic,
  onLoadClip,
  onLoadMoreItems,
  onLoadPoster,
  onSaveTemplate,
  onStatusFilterChange,
  onUpdateMusic,
  onUpdatePostedStatus,
  onUpdateSourceSettings,
  onUpdateTextOverlay,
  ugcClips,
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
  const statusFilterOptions: {
    label: string;
    value: StitchLibraryStatusFilter;
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
            {totalCount ?? stitches.length}
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          {onStatusFilterChange ? (
            <div
              className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-slate-100 p-1"
              aria-label="Stitch status filter"
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
      </div>
      {stitches.length ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {pagination.pageItems.map((stitch) => (
              <StitchCard
                key={stitch.id}
                stitch={stitch}
                demoClips={demoClips}
                isSelected={batchDelete.selectedIds.has(stitch.id)}
                isSelectionDisabled={batchDelete.isDeletingSelected}
                isSavingTemplate={savingTemplateStitchId === stitch.id}
                onDelete={onDelete}
                onGenerateMusic={onGenerateMusic}
                onLoadClip={onLoadClip}
                onLoadPoster={onLoadPoster}
                onSaveTemplate={onSaveTemplate}
                onSelect={
                  batchDelete.isSelecting
                    ? () => batchDelete.toggleItemSelection(stitch.id)
                    : undefined
                }
                onUpdateMusic={onUpdateMusic}
                onUpdatePostedStatus={onUpdatePostedStatus}
                onUpdateSourceSettings={onUpdateSourceSettings}
                onUpdateTextOverlay={onUpdateTextOverlay}
                ugcClips={ugcClips}
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
