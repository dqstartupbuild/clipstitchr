"use client";

import { useCallback, useMemo } from "react";
import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { LibraryBatchActionBar } from "@/app/_components/dashboard/LibraryBatchActionBar";
import { StitchCard } from "@/app/_components/dashboard/StitchCard";
import { Button } from "@/app/_components/ui/Button";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { StatusFilterTabs } from "@/app/_components/ui/StatusFilterTabs";
import { createPostBridgeDefaultAccountResolver } from "@/lib/clipstitchr/client/createPostBridgeDefaultAccountResolver";
import { createStitchPostBridgeScheduleMedia } from "@/lib/clipstitchr/client/createStitchPostBridgeScheduleMedia";
import { schedulePostBridgePost } from "@/lib/clipstitchr/client/schedulePostBridgePost";
import { uploadLibraryPageSize } from "@/lib/clipstitchr/constants/uploadLibraryPageSize";
import { useLibraryBatchDelete } from "@/lib/clipstitchr/hooks/useLibraryBatchDelete";
import { useLibraryBatchQueue } from "@/lib/clipstitchr/hooks/useLibraryBatchQueue";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { QuickEditCrop } from "@/lib/clipstitchr/types/QuickEditCrop";
import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchrHookPlan } from "@/lib/clipstitchr/types/StitchrHookPlan";
import type { StitchLibraryStatusFilter } from "@/lib/clipstitchr/types/StitchLibraryStatusFilter";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";
import type { StitchScore } from "@/lib/clipstitchr/types/StitchScore";
import type { StitchSourceSettingsUpdate } from "@/lib/clipstitchr/types/StitchSourceSettingsUpdate";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type StitchesSectionProps = {
  demoClips: VideoClipMetadata[];
  hookPlans?: StitchrHookPlan[];
  savingHookPlanId?: string | null;
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
  onAcceptHookVariant?: (planId: string, hookText: string) => void;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onLoadMoreItems?: () => void;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onLoadVideo?: (stitch: Stitch) => Promise<Blob | null>;
  onPostBridgeScheduled?: () => void | Promise<void>;
  onSaveTemplate?: (stitch: Stitch) => void | Promise<unknown>;
  onScore?: (stitch: Stitch) => Promise<StitchScore>;
  onApplyQuickEdit?: (stitch: Stitch) => Promise<void>;
  onResetQuickEdit?: (stitch: Stitch) => Promise<void>;
  onRejectHookVariant?: (planId: string, hookText: string) => void;
  onSelectHookVariant?: (planId: string, hookText: string) => void;
  onStatusFilterChange?: (status: StitchLibraryStatusFilter) => void;
  onUpdateMusic: (
    stitch: Stitch,
    music: StitchMusicMetadata | null,
  ) => void | Promise<void>;
  onUpdateSocialCaption: (
    stitch: Stitch,
    socialCaption: string | null,
  ) => void | Promise<void>;
  onUpdatePostedStatus: (
    stitch: Stitch,
    isPosted: boolean,
  ) => void | Promise<void>;
  onUpdateSourceSettings: (
    stitch: Stitch,
    update: StitchSourceSettingsUpdate,
  ) => void | Promise<void>;
  onUpdateSourceCrop?: (
    stitch: Stitch,
    source: "ugc" | "demo",
    crop: QuickEditCrop | null,
  ) => void | Promise<void>;
  onUpdateSourceCuts?: (
    stitch: Stitch,
    source: "ugc" | "demo",
    removeRanges: QuickEditRemoveRange[],
  ) => void | Promise<void>;
  onUpdateTextOverlay: (
    stitch: Stitch,
    textOverlay: TextOverlay | TextOverlay[] | null,
  ) => void | Promise<void>;
  ugcClips: VideoClipMetadata[];
};

export function StitchesSection({
  demoClips,
  hookPlans = [],
  savingHookPlanId = null,
  stitches,
  emptyDescription = "Create a Stitch after you have at least one Hook/UGC clip and one product demo.",
  emptyTitle = "No Stitches yet",
  hasMoreItems = false,
  id = "stitches",
  isLoadingMoreItems = false,
  savingTemplateStitchId = null,
  statusCounts,
  statusFilter = "active",
  title = "Stitches",
  totalCount,
  onDelete,
  onAcceptHookVariant,
  onLoadClip,
  onLoadMoreItems,
  onLoadPoster,
  onLoadVideo,
  onPostBridgeScheduled,
  onSaveTemplate,
  onScore,
  onApplyQuickEdit,
  onResetQuickEdit,
  onRejectHookVariant,
  onSelectHookVariant,
  onStatusFilterChange,
  onUpdateMusic,
  onUpdatePostedStatus,
  onUpdateSocialCaption,
  onUpdateSourceCrop,
  onUpdateSourceCuts,
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
  const resolvePostBridgeDefaultAccounts = useMemo(
    () => createPostBridgeDefaultAccountResolver(),
    [],
  );
  const selectedStitches = useMemo(
    () => stitches.filter((stitch) => batchDelete.selectedIds.has(stitch.id)),
    [batchDelete.selectedIds, stitches],
  );
  const queueStitch = useCallback(
    async (stitch: Stitch) => {
      const accountSelection = await resolvePostBridgeDefaultAccounts(
        stitch.productId,
      );
      const renderResult = await createStitchPostBridgeScheduleMedia({
        loadClip: onLoadClip,
        loadVideo: onLoadVideo,
        onProgress: () => undefined,
        stitch,
      });

      await schedulePostBridgePost({
        caption: stitch.socialCaption ?? "",
        hasAudio: renderResult.hasAudio,
        mediaFiles: renderResult.mediaFiles,
        socialAccountIds: accountSelection.socialAccountIds,
        sourceId: stitch.id,
        sourceType: "stitch",
        title: stitch.name,
        useQueue: true,
      });
    },
    [onLoadClip, onLoadVideo, resolvePostBridgeDefaultAccounts],
  );
  const batchQueue = useLibraryBatchQueue({
    itemName: "stitch",
    itemPluralName: "stitches",
    items: selectedStitches,
    onComplete: async () => {
      batchDelete.stopSelecting();
      await onPostBridgeScheduled?.();
    },
    onQueueItem: queueStitch,
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
            <StatusFilterTabs
              ariaLabel="Stitch status filter"
              counts={statusCounts}
              options={statusFilterOptions}
              value={statusFilter}
              onChange={onStatusFilterChange}
            />
          ) : null}
          {stitches.length ? (
            <LibraryBatchActionBar
              areAllVisibleItemsSelected={batchDelete.areAllVisibleItemsSelected}
              isDeletingSelected={batchDelete.isDeletingSelected}
              isQueueingSelected={batchQueue.isQueueingSelected}
              isSelecting={batchDelete.isSelecting}
              queueStatusMessage={batchQueue.queueStatusMessage}
              selectedCount={batchDelete.selectedCount}
              visibleItemCount={batchDelete.visibleItemCount}
              onClearSelection={batchDelete.clearSelection}
              onDeleteSelected={() => {
                void batchDelete.deleteSelectedItems();
              }}
              onQueueSelected={() => {
                void batchQueue.queueSelectedItems();
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
                hookPlans={hookPlans}
                savingHookPlanId={savingHookPlanId}
                isSelected={batchDelete.selectedIds.has(stitch.id)}
                isSelectionDisabled={
                  batchDelete.isDeletingSelected || batchQueue.isQueueingSelected
                }
                isSavingTemplate={savingTemplateStitchId === stitch.id}
                onDelete={onDelete}
                onAcceptHookVariant={onAcceptHookVariant}
                onLoadClip={onLoadClip}
                onLoadPoster={onLoadPoster}
                onLoadVideo={onLoadVideo}
                onPostBridgeScheduled={onPostBridgeScheduled}
                onSaveTemplate={onSaveTemplate}
                onScore={onScore}
                onApplyQuickEdit={onApplyQuickEdit}
                onResetQuickEdit={onResetQuickEdit}
                onRejectHookVariant={onRejectHookVariant}
                onSelect={
                  batchDelete.isSelecting
                    ? () => batchDelete.toggleItemSelection(stitch.id)
                    : undefined
                }
                onUpdateMusic={onUpdateMusic}
                onUpdatePostedStatus={onUpdatePostedStatus}
                onUpdateSocialCaption={onUpdateSocialCaption}
                onUpdateSourceCrop={onUpdateSourceCrop}
                onUpdateSourceCuts={onUpdateSourceCuts}
                onUpdateSourceSettings={onUpdateSourceSettings}
                onUpdateTextOverlay={onUpdateTextOverlay}
                onSelectHookVariant={onSelectHookVariant}
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
