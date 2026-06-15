"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { LibraryPageHeader } from "@/app/_components/dashboard/LibraryPageHeader";
import { StitchesSection } from "@/app/_components/dashboard/StitchesSection";
import { SwiprSwipesSection } from "@/app/_components/dashboard/SwiprSwipesSection";
import { UploadPanel } from "@/app/_components/dashboard/UploadPanel";
import { VideoLibrarySection } from "@/app/_components/dashboard/VideoLibrarySection";
import { ProductDemoUploadControls } from "@/app/_components/products/ProductDemoUploadControls";
import { ProductFilterSelect } from "@/app/_components/products/ProductFilterSelect";
import { UploadLibraryTabs } from "@/app/_components/uploads/UploadLibraryTabs";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import { SHOW_UPLOAD_CONTROLS_EVENT_NAME } from "@/lib/clipstitchr/constants/showUploadControlsEventName";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { useCreateAvatarFromUgcClip } from "@/lib/clipstitchr/hooks/useCreateAvatarFromUgcClip";
import { usePhotoLibrary } from "@/lib/clipstitchr/hooks/usePhotoLibrary";
import { useProducts } from "@/lib/clipstitchr/hooks/useProducts";
import { useShowUploadControls } from "@/lib/clipstitchr/hooks/useShowUploadControls";
import { useStitchTemplateActions } from "@/lib/clipstitchr/hooks/useStitchTemplateActions";
import { useSwiprLibrary } from "@/lib/clipstitchr/hooks/useSwiprLibrary";
import type { CreateAvatarFromUgcClipOptions } from "@/lib/clipstitchr/types/CreateAvatarFromUgcClipOptions";
import type { ClipLibrarySortOrder } from "@/lib/clipstitchr/types/ClipLibrarySortOrder";
import type { LibraryPostedStatusFilter } from "@/lib/clipstitchr/types/LibraryPostedStatusFilter";
import type { StitchLibraryStatusFilter } from "@/lib/clipstitchr/types/StitchLibraryStatusFilter";
import type { UploadLibraryTab } from "@/lib/clipstitchr/types/UploadLibraryTab";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { filterClipsBySearchQuery } from "@/lib/clipstitchr/utils/filterClipsBySearchQuery";
import { filterClipsByDemoProductId } from "@/lib/clipstitchr/utils/filterClipsByDemoProductId";
import { filterStitchesByName } from "@/lib/clipstitchr/utils/filterStitchesByName";
import { filterSwipesBySearchQuery } from "@/lib/clipstitchr/utils/filterSwipesBySearchQuery";
import { dispatchHideUploadControlsEvent } from "@/lib/clipstitchr/utils/dispatchHideUploadControlsEvent";
import { getInitialUploadLibraryTab } from "@/lib/clipstitchr/utils/getInitialUploadLibraryTab";
import { getStitchrUgcSourceClips } from "@/lib/clipstitchr/utils/getStitchrUgcSourceClips";
import { getUploadAssetTypeFromLibraryTab } from "@/lib/clipstitchr/utils/getUploadAssetTypeFromLibraryTab";
import { getUploadLibraryTabFromAssetType } from "@/lib/clipstitchr/utils/getUploadLibraryTabFromAssetType";

type VideoLibraryTab = "ugc" | "demo" | "swaps";

const sortOptions = [
  { label: "Most recent", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

const videoLibraryContent: Record<
  VideoLibraryTab,
  {
    emptyDescription: string;
    emptyTitle: string;
    sectionId: string;
    searchEmptyDescription: string;
    searchEmptyTitle: string;
    title: string;
  }
> = {
  ugc: {
    title: "UGC",
    emptyTitle: "No UGC yet",
    emptyDescription:
      "Upload or generate hooks, reactions, b-roll, or creator footage to pair with demos.",
    sectionId: "ugc-clips",
    searchEmptyTitle: "No matching UGC",
    searchEmptyDescription:
      "No saved UGC matches that title or tag.",
  },
  demo: {
    title: "Demo Videos",
    emptyTitle: "No demo videos yet",
    emptyDescription:
      "Upload product walkthroughs or screen recordings to use after UGC.",
    sectionId: "demo-videos",
    searchEmptyTitle: "No matching demo videos",
    searchEmptyDescription:
      "No saved demo videos match that title or tag.",
  },
  swaps: {
    title: "Swaps",
    emptyTitle: "No swaps yet",
    emptyDescription:
      "Create new UGC when your library needs more material.",
    sectionId: "swaps",
    searchEmptyTitle: "No matching swaps",
    searchEmptyDescription:
      "No saved Swapr outputs match that title or tag.",
  },
};

export function UploadsPageClient() {
  const library = useClipLibrary();
  const photoLibrary = usePhotoLibrary();
  const products = useProducts();
  const stitchTemplateActions = useStitchTemplateActions();
  const swiprLibrary = useSwiprLibrary();
  const showUploadControls = useShowUploadControls();
  const avatarCreator = useCreateAvatarFromUgcClip({
    createAvatar: photoLibrary.createAvatar,
    loadClip: library.loadClip,
    saveGeneratedPhotos: photoLibrary.saveGeneratedPhotos,
  });
  const [selectedTab, setSelectedTab] = useState<UploadLibraryTab>(
    getInitialUploadLibraryTab,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [demoProductFilterId, setDemoProductFilterId] = useState<
    string | undefined
  >();
  const [demoUploadProductId, setDemoUploadProductId] = useState("");
  const [stitchStatusFilter, setStitchStatusFilter] =
    useState<StitchLibraryStatusFilter>("active");
  const [swipeStatusFilter, setSwipeStatusFilter] =
    useState<LibraryPostedStatusFilter>("active");
  const productIds = useMemo(
    () => new Set(products.products.map((product) => product.id)),
    [products.products],
  );
  const defaultProductFilterId = products.defaultProductId ?? "all";
  const activeDemoProductFilterId =
    demoProductFilterId === undefined
      ? defaultProductFilterId
      : demoProductFilterId === "all" || productIds.has(demoProductFilterId)
        ? demoProductFilterId
      : "all";
  const activeDemoUploadProductId = productIds.has(demoUploadProductId)
    ? demoUploadProductId
    : (products.defaultProductId ?? products.products[0]?.id ?? "");
  const ugcClips = useMemo(
    () => filterClipsBySearchQuery(library.videoGroups.ugc.clips, searchQuery),
    [library.videoGroups.ugc.clips, searchQuery],
  );
  const allDemoClips = useMemo(
    () => filterClipsBySearchQuery(library.videoGroups.demo.clips, searchQuery),
    [library.videoGroups.demo.clips, searchQuery],
  );
  const demoClips = useMemo(
    () =>
      filterClipsByDemoProductId(
        allDemoClips,
        selectedTab === "demo" ? activeDemoProductFilterId : "all",
      ),
    [activeDemoProductFilterId, allDemoClips, selectedTab],
  );
  const swapClips = useMemo(
    () =>
      filterClipsBySearchQuery(library.videoGroups.swapr.clips, searchQuery),
    [library.videoGroups.swapr.clips, searchQuery],
  );
  const stitchrUgcClips = useMemo(
    () =>
      getStitchrUgcSourceClips(
        library.videoGroups.ugc.clips,
        library.videoGroups.clipr.clips,
        library.videoGroups.swapr.clips,
      ),
    [
      library.videoGroups.clipr.clips,
      library.videoGroups.swapr.clips,
      library.videoGroups.ugc.clips,
    ],
  );
  const activeStitches = useMemo(
    () => filterStitchesByName(library.stitches, searchQuery),
    [library.stitches, searchQuery],
  );
  const postedStitches = useMemo(
    () => filterStitchesByName(library.postedStitches, searchQuery),
    [library.postedStitches, searchQuery],
  );
  const allStitches = useMemo(
    () =>
      [...activeStitches, ...postedStitches].sort((left, right) => {
        const leftTime = Date.parse(left.createdAt);
        const rightTime = Date.parse(right.createdAt);

        return library.sortOrder === "oldest"
          ? leftTime - rightTime
          : rightTime - leftTime;
      }),
    [activeStitches, library.sortOrder, postedStitches],
  );
  const stitches =
    stitchStatusFilter === "posted"
      ? postedStitches
      : stitchStatusFilter === "all"
        ? allStitches
        : activeStitches;
  const stitchStatusCounts = useMemo(
    () => ({
      active: activeStitches.length,
      all: allStitches.length,
      posted: postedStitches.length,
    }),
    [activeStitches.length, allStitches.length, postedStitches.length],
  );
  const activeSwipes = useMemo(() => {
    const sortedSwipes = [...swiprLibrary.swipes].sort((left, right) => {
      const leftTime = Date.parse(left.createdAt);
      const rightTime = Date.parse(right.createdAt);

      return library.sortOrder === "oldest"
        ? leftTime - rightTime
        : rightTime - leftTime;
    });

    return filterSwipesBySearchQuery(sortedSwipes, searchQuery);
  }, [library.sortOrder, searchQuery, swiprLibrary.swipes]);
  const postedSwipes = useMemo(() => {
    const sortedSwipes = [...swiprLibrary.postedSwipes].sort((left, right) => {
      const leftTime = Date.parse(left.createdAt);
      const rightTime = Date.parse(right.createdAt);

      return library.sortOrder === "oldest"
        ? leftTime - rightTime
        : rightTime - leftTime;
    });

    return filterSwipesBySearchQuery(sortedSwipes, searchQuery);
  }, [library.sortOrder, searchQuery, swiprLibrary.postedSwipes]);
  const allSwipes = useMemo(
    () =>
      [...activeSwipes, ...postedSwipes].sort((left, right) => {
        const leftTime = Date.parse(left.createdAt);
        const rightTime = Date.parse(right.createdAt);

        return library.sortOrder === "oldest"
          ? leftTime - rightTime
          : rightTime - leftTime;
      }),
    [activeSwipes, library.sortOrder, postedSwipes],
  );
  const swipes =
    swipeStatusFilter === "posted"
      ? postedSwipes
      : swipeStatusFilter === "all"
        ? allSwipes
        : activeSwipes;
  const swipeStatusCounts = useMemo(
    () => ({
      active: activeSwipes.length,
      all: allSwipes.length,
      posted: postedSwipes.length,
    }),
    [activeSwipes.length, allSwipes.length, postedSwipes.length],
  );
  const hasSearchQuery = searchQuery.trim().length > 0;
  const error =
    library.error ??
    swiprLibrary.error ??
    products.error ??
    stitchTemplateActions.error;
  const hasDemoProductFilter =
    selectedTab === "demo" && activeDemoProductFilterId !== "all";
  const canUseLibraryTotals = !hasSearchQuery;
  const selectedVideoTotalCount =
    !canUseLibraryTotals || hasDemoProductFilter
      ? undefined
      : selectedTab === "ugc"
        ? library.counts.ugcClips
        : selectedTab === "demo"
          ? library.counts.demoClips
          : selectedTab === "swaps"
            ? library.counts.swapClips
            : undefined;
  const canUploadDemo =
    products.products.length > 0 && activeDemoUploadProductId.length > 0;
  const demoUploadBlockedMessage = products.isLoading
    ? "Products are loading."
    : "Create a product in Settings before uploading demo videos.";
  const selectedVideoSection =
    selectedTab === "ugc"
        ? {
            clips: ugcClips,
            content: videoLibraryContent.ugc,
            group: library.videoGroups.ugc,
          }
        : selectedTab === "demo"
          ? {
              clips: demoClips,
              content: videoLibraryContent.demo,
              group: library.videoGroups.demo,
            }
          : selectedTab === "swaps"
            ? {
                clips: swapClips,
                content: videoLibraryContent.swaps,
                group: library.videoGroups.swapr,
              }
            : null;
  const selectedStitchHasMoreItems =
    stitchStatusFilter === "posted"
      ? library.hasMorePostedStitches
      : stitchStatusFilter === "all"
        ? library.hasMoreStitches || library.hasMorePostedStitches
        : library.hasMoreStitches;
  const selectedStitchIsLoadingMoreItems =
    stitchStatusFilter === "posted"
      ? library.isLoadingMorePostedStitches
      : stitchStatusFilter === "all"
        ? library.isLoadingMoreStitches || library.isLoadingMorePostedStitches
        : library.isLoadingMoreStitches;
  const handleLoadMoreSelectedStitches = useCallback(() => {
    if (stitchStatusFilter === "posted") {
      library.loadMorePostedStitches();
      return;
    }

    if (stitchStatusFilter === "all") {
      library.loadMoreStitches();
      library.loadMorePostedStitches();
      return;
    }

    library.loadMoreStitches();
  }, [library, stitchStatusFilter]);
  const handleTabChange = useCallback((nextTab: UploadLibraryTab) => {
    setSelectedTab(nextTab);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", nextTab);
      window.history.replaceState(null, "", url.toString());
    }
  }, []);
  const handleCreateAvatarFromClip = useCallback(
    async (
      clip: VideoClipMetadata,
      options: CreateAvatarFromUgcClipOptions,
    ) => Boolean(await avatarCreator.generate(clip, options)),
    [avatarCreator],
  );

  useEffect(() => {
    const syncUploadTabFromUrl = () => {
      setSelectedTab(getInitialUploadLibraryTab());
    };

    syncUploadTabFromUrl();
    window.addEventListener("popstate", syncUploadTabFromUrl);

    return () => {
      window.removeEventListener("popstate", syncUploadTabFromUrl);
    };
  }, []);

  useEffect(() => {
    const syncUploadTabFromEvent = (event: Event) => {
      if (!(event instanceof CustomEvent)) {
        return;
      }

      const assetType = (event.detail as { assetType?: unknown }).assetType;

      if (assetType === "ugc" || assetType === "demo") {
        handleTabChange(assetType);
      }
    };

    window.addEventListener(
      SHOW_UPLOAD_CONTROLS_EVENT_NAME,
      syncUploadTabFromEvent,
    );

    return () => {
      window.removeEventListener(
        SHOW_UPLOAD_CONTROLS_EVENT_NAME,
        syncUploadTabFromEvent,
      );
    };
  }, [handleTabChange]);

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <LibraryPageHeader
          eyebrow="Library"
          title="Content Library"
          description="Keep UGC, product demos, swaps, Swipes, and stitches ready for the next export."
        />
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {avatarCreator.createdAvatar && avatarCreator.generatedCount ? (
          <div className="rounded-lg border border-accent/25 bg-surface-muted p-4 text-sm font-semibold text-accent-dark">
            Queued {avatarCreator.generatedCount} generated photos for{" "}
            {avatarCreator.createdAvatar.name}.
          </div>
        ) : null}
        {showUploadControls ? (
          <UploadPanel
            allowedAssetTypes={["ugc", "demo"]}
            key={selectedTab}
            initialAssetType={getUploadAssetTypeFromLibraryTab(selectedTab)}
            isPhotoUploading={photoLibrary.isSaving}
            canUploadDemo={canUploadDemo}
            demoProductId={activeDemoUploadProductId}
            demoUploadBlockedMessage={demoUploadBlockedMessage}
            demoControls={
              <ProductDemoUploadControls
                products={products.products}
                isLoading={products.isLoading}
                selectedProductId={activeDemoUploadProductId}
                onSelectedProductIdChange={setDemoUploadProductId}
              />
            }
            onDismiss={dispatchHideUploadControlsEvent}
            onAssetTypeChange={(assetType) =>
              handleTabChange(getUploadLibraryTabFromAssetType(assetType))
            }
            onPhotoUploaded={photoLibrary.saveFiles}
            onUploaded={library.refresh}
          />
        ) : null}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <UploadLibraryTabs value={selectedTab} onChange={handleTabChange} />
          <div
            className={[
              "grid w-full gap-3 sm:items-end",
              selectedTab === "demo"
                ? "sm:grid-cols-3 lg:max-w-3xl"
                : "sm:grid-cols-2 lg:max-w-xl",
            ].join(" ")}
          >
            <SelectInput
              label="Sort"
              options={sortOptions}
              value={library.sortOrder}
              onChange={(event) =>
                library.setSortOrder(event.target.value as ClipLibrarySortOrder)
              }
            />
            {selectedTab === "demo" ? (
              <ProductFilterSelect
                products={products.products}
                label="Product"
                value={activeDemoProductFilterId}
                onChange={setDemoProductFilterId}
              />
            ) : null}
            <SearchInput
              label="Search library"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search library"
              className="w-full"
            />
          </div>
        </div>
        {selectedTab === "all" ? (
          <div className="flex flex-col gap-8">
            <VideoLibrarySection
              key={`all-ugc-${searchQuery}-${library.sortOrder}`}
              id={videoLibraryContent.ugc.sectionId}
              title={videoLibraryContent.ugc.title}
              clips={ugcClips}
              totalCount={
                canUseLibraryTotals ? library.counts.ugcClips : undefined
              }
              products={products.products}
              avatarCreatorError={avatarCreator.error}
              emptyTitle={
                hasSearchQuery
                  ? videoLibraryContent.ugc.searchEmptyTitle
                  : videoLibraryContent.ugc.emptyTitle
              }
              emptyDescription={
                hasSearchQuery
                  ? videoLibraryContent.ugc.searchEmptyDescription
                  : videoLibraryContent.ugc.emptyDescription
              }
              hasMoreItems={library.videoGroups.ugc.hasMoreItems}
              isLoadingMoreItems={library.videoGroups.ugc.isLoadingMoreItems}
              loadMoreLabel="Load more videos"
              onLoadClip={library.loadClip}
              onLoadPoster={library.loadClipPoster}
              onLoadMoreItems={library.videoGroups.ugc.loadMoreItems}
              isCreatingAvatarFromClip={avatarCreator.isGenerating}
              onDelete={library.removeClip}
              onGenerateCliprMusic={library.generateCliprMusic}
              onScoreClip={library.scoreClip}
              onUpdateCliprMusic={library.updateCliprMusic}
              onUpdateMetadata={library.updateClipMetadata}
              onUpdateTrim={library.updateClipTrimRange}
              onUpdatePostedStatus={library.updateClipPostedStatus}
              onCreateAvatarFromClip={handleCreateAvatarFromClip}
            />
            <VideoLibrarySection
              key={`all-demo-${searchQuery}-${library.sortOrder}`}
              id={videoLibraryContent.demo.sectionId}
              title={videoLibraryContent.demo.title}
              clips={demoClips}
              totalCount={
                canUseLibraryTotals ? library.counts.demoClips : undefined
              }
              products={products.products}
              emptyTitle={
                hasSearchQuery
                  ? videoLibraryContent.demo.searchEmptyTitle
                  : videoLibraryContent.demo.emptyTitle
              }
              emptyDescription={
                hasSearchQuery
                  ? videoLibraryContent.demo.searchEmptyDescription
                  : videoLibraryContent.demo.emptyDescription
              }
              hasMoreItems={library.videoGroups.demo.hasMoreItems}
              isLoadingMoreItems={library.videoGroups.demo.isLoadingMoreItems}
              loadMoreLabel="Load more videos"
              onLoadClip={library.loadClip}
              onLoadPoster={library.loadClipPoster}
              onLoadMoreItems={library.videoGroups.demo.loadMoreItems}
              onDelete={library.removeClip}
              onGenerateCliprMusic={library.generateCliprMusic}
              onScoreClip={library.scoreClip}
              onUpdateCliprMusic={library.updateCliprMusic}
              onUpdateMetadata={library.updateClipMetadata}
              onUpdateTrim={library.updateClipTrimRange}
              onUpdatePostedStatus={library.updateClipPostedStatus}
            />
            <VideoLibrarySection
              key={`all-swaps-${searchQuery}-${library.sortOrder}`}
              id={videoLibraryContent.swaps.sectionId}
              title={videoLibraryContent.swaps.title}
              clips={swapClips}
              totalCount={
                canUseLibraryTotals ? library.counts.swapClips : undefined
              }
              products={products.products}
              emptyTitle={
                hasSearchQuery
                  ? videoLibraryContent.swaps.searchEmptyTitle
                  : videoLibraryContent.swaps.emptyTitle
              }
              emptyDescription={
                hasSearchQuery
                  ? videoLibraryContent.swaps.searchEmptyDescription
                  : videoLibraryContent.swaps.emptyDescription
              }
              hasMoreItems={library.videoGroups.swapr.hasMoreItems}
              isLoadingMoreItems={library.videoGroups.swapr.isLoadingMoreItems}
              loadMoreLabel="Load more videos"
              onLoadClip={library.loadClip}
              onLoadPoster={library.loadClipPoster}
              onLoadMoreItems={library.videoGroups.swapr.loadMoreItems}
              onDelete={library.removeClip}
              onGenerateCliprMusic={library.generateCliprMusic}
              onScoreClip={library.scoreClip}
              onUpdateCliprMusic={library.updateCliprMusic}
              onUpdateMetadata={library.updateClipMetadata}
              onUpdateTrim={library.updateClipTrimRange}
              onUpdatePostedStatus={library.updateClipPostedStatus}
            />
            <StitchesSection
              key={`all-stitches-${searchQuery}-${library.sortOrder}`}
              demoClips={library.videoGroups.demo.clips}
              savingTemplateStitchId={stitchTemplateActions.savingStitchId}
              stitches={activeStitches}
              totalCount={hasSearchQuery ? undefined : activeStitches.length}
              emptyTitle={hasSearchQuery ? "No matching stitches" : undefined}
              emptyDescription={
                hasSearchQuery
                  ? "No stitches match that name."
                  : undefined
              }
              hasMoreItems={library.hasMoreStitches}
              isLoadingMoreItems={library.isLoadingMoreStitches}
              onDelete={library.removeStitch}
              onGenerateMusic={library.generateStitchMusic}
              onLoadClip={library.loadClip}
              onLoadMoreItems={library.loadMoreStitches}
              onLoadPoster={library.loadStitchPoster}
              onLoadVideo={library.loadStitchVideo}
              onSaveTemplate={stitchTemplateActions.createTemplateFromStitch}
              onScore={library.scoreStitch}
              onUpdateMusic={library.updateStitchMusic}
              onUpdatePostedStatus={library.updateStitchPostedStatus}
              onUpdateSocialCaption={library.updateStitchSocialCaption}
              onUpdateSourceSettings={library.updateStitchSourceSettings}
              onUpdateTextOverlay={library.updateStitchTextOverlay}
              ugcClips={stitchrUgcClips}
            />
            <SwiprSwipesSection
              key={`all-swipes-${searchQuery}-${library.sortOrder}`}
              backgrounds={swiprLibrary.backgrounds}
              isSaving={swiprLibrary.isSavingSwipe}
              swipes={activeSwipes}
              emptyTitle={hasSearchQuery ? "No matching Swipes" : undefined}
              emptyDescription={
                hasSearchQuery
                  ? "No saved Swipes match that search."
                  : undefined
              }
              onLoadBackgroundBlob={swiprLibrary.loadBackgroundBlob}
              onLoadPoster={swiprLibrary.loadSwipePoster}
              onDelete={swiprLibrary.removeSwipe}
              onSave={swiprLibrary.saveSwipe}
              onUpdatePostedStatus={swiprLibrary.updateSwipePostedStatus}
            />
          </div>
        ) : null}
        {selectedVideoSection ? (
          <VideoLibrarySection
            key={`${selectedTab}-${searchQuery}-${library.sortOrder}`}
            id={selectedVideoSection.content.sectionId}
            title={selectedVideoSection.content.title}
            clips={selectedVideoSection.clips}
            totalCount={selectedVideoTotalCount}
            products={products.products}
            avatarCreatorError={
              selectedTab === "ugc" ? avatarCreator.error : null
            }
            emptyTitle={
              hasSearchQuery
                ? selectedVideoSection.content.searchEmptyTitle
                : hasDemoProductFilter
                  ? "No demos for this product"
                : selectedVideoSection.content.emptyTitle
            }
            emptyDescription={
              hasSearchQuery
                ? selectedVideoSection.content.searchEmptyDescription
                : hasDemoProductFilter
                  ? "No saved demo videos are linked to that product."
                : selectedVideoSection.content.emptyDescription
            }
            hasMoreItems={selectedVideoSection.group.hasMoreItems}
            isLoadingMoreItems={selectedVideoSection.group.isLoadingMoreItems}
            loadMoreLabel="Load more videos"
            onLoadClip={library.loadClip}
            onLoadPoster={library.loadClipPoster}
            onLoadMoreItems={selectedVideoSection.group.loadMoreItems}
            isCreatingAvatarFromClip={
              selectedTab === "ugc" && avatarCreator.isGenerating
            }
            onDelete={library.removeClip}
            onGenerateCliprMusic={library.generateCliprMusic}
            onScoreClip={library.scoreClip}
            onUpdateCliprMusic={library.updateCliprMusic}
            onUpdateMetadata={library.updateClipMetadata}
            onUpdateTrim={library.updateClipTrimRange}
            onUpdatePostedStatus={library.updateClipPostedStatus}
            onCreateAvatarFromClip={
              selectedTab === "ugc" ? handleCreateAvatarFromClip : undefined
            }
          />
        ) : null}
        {selectedTab === "stitches" ? (
          <StitchesSection
            key={`stitches-${searchQuery}-${library.sortOrder}`}
            demoClips={library.videoGroups.demo.clips}
            savingTemplateStitchId={stitchTemplateActions.savingStitchId}
            stitches={stitches}
            totalCount={
              hasSearchQuery ? undefined : stitchStatusCounts[stitchStatusFilter]
            }
            emptyTitle={
              hasSearchQuery
                ? "No matching stitches"
                : stitchStatusFilter === "posted"
                  ? "No posted stitches"
                  : stitchStatusFilter === "all"
                    ? "No stitches yet"
                    : undefined
            }
            emptyDescription={
              hasSearchQuery
                ? "No stitches match that name."
                : stitchStatusFilter === "posted"
                  ? "Mark finished stitches as posted after they go live."
                  : undefined
            }
            hasMoreItems={selectedStitchHasMoreItems}
            isLoadingMoreItems={selectedStitchIsLoadingMoreItems}
            onDelete={library.removeStitch}
            onGenerateMusic={library.generateStitchMusic}
            onLoadClip={library.loadClip}
            onLoadMoreItems={handleLoadMoreSelectedStitches}
            onLoadPoster={library.loadStitchPoster}
            onLoadVideo={library.loadStitchVideo}
            onSaveTemplate={stitchTemplateActions.createTemplateFromStitch}
            onScore={library.scoreStitch}
            statusCounts={stitchStatusCounts}
            statusFilter={stitchStatusFilter}
            onStatusFilterChange={setStitchStatusFilter}
            onUpdateMusic={library.updateStitchMusic}
            onUpdatePostedStatus={library.updateStitchPostedStatus}
            onUpdateSocialCaption={library.updateStitchSocialCaption}
            onUpdateSourceSettings={library.updateStitchSourceSettings}
            onUpdateTextOverlay={library.updateStitchTextOverlay}
            ugcClips={stitchrUgcClips}
          />
        ) : null}
        {selectedTab === "swipes" ? (
          <SwiprSwipesSection
            key={`swipes-${searchQuery}-${library.sortOrder}-${swipeStatusFilter}`}
            backgrounds={swiprLibrary.backgrounds}
            isSaving={swiprLibrary.isSavingSwipe}
            swipes={swipes}
            emptyTitle={
              hasSearchQuery
                ? "No matching Swipes"
                : swipeStatusFilter === "posted"
                  ? "No posted Swipes"
                  : swipeStatusFilter === "all"
                    ? "No Swipes yet"
                    : undefined
            }
            emptyDescription={
              hasSearchQuery
                ? "No saved Swipes match that search."
                : swipeStatusFilter === "posted"
                  ? "Mark saved Swipes as posted after they go live."
                : undefined
            }
            statusCounts={swipeStatusCounts}
            statusFilter={swipeStatusFilter}
            onLoadBackgroundBlob={swiprLibrary.loadBackgroundBlob}
            onLoadPoster={swiprLibrary.loadSwipePoster}
            onDelete={swiprLibrary.removeSwipe}
            onSave={swiprLibrary.saveSwipe}
            onStatusFilterChange={setSwipeStatusFilter}
            onUpdatePostedStatus={swiprLibrary.updateSwipePostedStatus}
          />
        ) : null}
      </div>
    </DashboardShell>
  );
}
