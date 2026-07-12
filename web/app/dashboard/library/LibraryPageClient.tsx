"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { LibraryPageHeader } from "@/app/_components/dashboard/LibraryPageHeader";
import { StitchesSection } from "@/app/_components/dashboard/StitchesSection";
import { SwiprSwipesSection } from "@/app/_components/dashboard/SwiprSwipesSection";
import { UploadPanel } from "@/app/_components/dashboard/UploadPanel";
import { VideoLibrarySection } from "@/app/_components/dashboard/VideoLibrarySection";
import { AvatarLibraryTabSection } from "@/app/_components/library/AvatarLibraryTabSection";
import { LibraryTabs } from "@/app/_components/library/LibraryTabs";
import { PexelsLibraryTabSection } from "@/app/_components/library/PexelsLibraryTabSection";
import { TemplateLibraryTabSection } from "@/app/_components/library/TemplateLibraryTabSection";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import { SHOW_UPLOAD_CONTROLS_EVENT_NAME } from "@/lib/clipstitchr/constants/showUploadControlsEventName";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { useCreateAvatarFromUgcClip } from "@/lib/clipstitchr/hooks/useCreateAvatarFromUgcClip";
import { useCreateHookLabIdeaFromStitch } from "@/lib/clipstitchr/hooks/useCreateHookLabIdeaFromStitch";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { usePhotoLibrary } from "@/lib/clipstitchr/hooks/usePhotoLibrary";
import { useShowUploadControls } from "@/lib/clipstitchr/hooks/useShowUploadControls";
import { useStitchTemplates } from "@/lib/clipstitchr/hooks/useStitchTemplates";
import { useStitchrHookPlans } from "@/lib/clipstitchr/hooks/useStitchrHookPlans";
import { useSwiprLibrary } from "@/lib/clipstitchr/hooks/useSwiprLibrary";
import type { CreateAvatarFromUgcClipOptions } from "@/lib/clipstitchr/types/CreateAvatarFromUgcClipOptions";
import type { ClipLibrarySortOrder } from "@/lib/clipstitchr/types/ClipLibrarySortOrder";
import type { LibraryTab } from "@/lib/clipstitchr/types/LibraryTab";
import type { LibraryPostedStatusFilter } from "@/lib/clipstitchr/types/LibraryPostedStatusFilter";
import type { StitchLibraryStatusFilter } from "@/lib/clipstitchr/types/StitchLibraryStatusFilter";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { filterClipsBySearchQuery } from "@/lib/clipstitchr/utils/filterClipsBySearchQuery";
import { filterStitchesByName } from "@/lib/clipstitchr/utils/filterStitchesByName";
import { filterSwipesBySearchQuery } from "@/lib/clipstitchr/utils/filterSwipesBySearchQuery";
import { dispatchHideUploadControlsEvent } from "@/lib/clipstitchr/utils/dispatchHideUploadControlsEvent";
import { dispatchLibraryTabChangeEvent } from "@/lib/clipstitchr/utils/dispatchLibraryTabChangeEvent";
import { getInitialLibraryTab } from "@/lib/clipstitchr/utils/getInitialLibraryTab";
import { getLibraryTabFromAssetType } from "@/lib/clipstitchr/utils/getLibraryTabFromAssetType";
import { getStitchrUgcSourceClips } from "@/lib/clipstitchr/utils/getStitchrUgcSourceClips";
import { getUploadAssetTypeFromLibraryTab } from "@/lib/clipstitchr/utils/getUploadAssetTypeFromLibraryTab";

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
    title: "Hook/UGC clips",
    emptyTitle: "No Hook/UGC clips yet",
    emptyDescription:
      "Upload or generate hooks, reactions, b-roll, or creator footage to pair with demos.",
    sectionId: "ugc-clips",
    searchEmptyTitle: "No matching Hook/UGC clips",
    searchEmptyDescription:
      "No saved Hook/UGC clips match that title or tag.",
  },
  demo: {
    title: "Product demos",
    emptyTitle: "No demo videos yet",
    emptyDescription:
      "Upload product walkthroughs or screen recordings to use after Hook/UGC clips.",
    sectionId: "demo-videos",
    searchEmptyTitle: "No matching demo videos",
    searchEmptyDescription:
      "No saved demo videos match that title or tag.",
  },
  swaps: {
    title: "Swaps",
    emptyTitle: "No swaps yet",
    emptyDescription:
      "Create new Hook/UGC clips when your library needs more material.",
    sectionId: "swaps",
    searchEmptyTitle: "No matching swaps",
    searchEmptyDescription:
      "No saved Swapr outputs match that title or tag.",
  },
};

export function LibraryPageClient() {
  const library = useClipLibrary();
  const photoLibrary = usePhotoLibrary();
  const products = useDashboardProduct();
  const swiprLibrary = useSwiprLibrary();
  const showUploadControls = useShowUploadControls();
  const avatarCreator = useCreateAvatarFromUgcClip({
    createAvatar: photoLibrary.createAvatar,
    loadClip: library.loadClip,
    saveGeneratedPhotos: photoLibrary.saveGeneratedPhotos,
  });
  const hookLabIdeaCreator = useCreateHookLabIdeaFromStitch();
  const [selectedTab, setSelectedTab] = useState<LibraryTab>(
    getInitialLibraryTab,
  );
  const stitchTemplates = useStitchTemplates(
    selectedTab === "stitches" || selectedTab === "templates",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [stitchStatusFilter, setStitchStatusFilter] =
    useState<StitchLibraryStatusFilter>("active");
  const [swipeStatusFilter, setSwipeStatusFilter] =
    useState<LibraryPostedStatusFilter>("active");
  const activeProductId = products.activeProductId ?? "";
  const hookPlans = useStitchrHookPlans(
    activeProductId || undefined,
    selectedTab === "stitches",
  );
  const ugcClips = useMemo(
    () => filterClipsBySearchQuery(library.videoGroups.ugc.clips, searchQuery),
    [library.videoGroups.ugc.clips, searchQuery],
  );
  const allDemoClips = useMemo(
    () => filterClipsBySearchQuery(library.videoGroups.demo.clips, searchQuery),
    [library.videoGroups.demo.clips, searchQuery],
  );
  const demoClips = useMemo(
    () => allDemoClips,
    [allDemoClips],
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
    hookLabIdeaCreator.error ??
    stitchTemplates.error ??
    (selectedTab === "stitches" ? hookPlans.error : null);
  const hasDemoProductFilter = false;
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
  const canUploadVideo = activeProductId.length > 0;
  const videoUploadBlockedMessage = products.isLoading
    ? "Products are loading."
    : "Create a product before uploading videos.";
  const canSortSelectedTab =
    selectedTab !== "avatars" &&
    selectedTab !== "templates" &&
    selectedTab !== "pexels";
  const searchPlaceholder =
    selectedTab === "avatars"
      ? "Search avatars"
      : selectedTab === "templates"
        ? "Search templates"
        : selectedTab === "pexels"
          ? "Search Pexels packs"
          : "Search library";
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
  const handleTabChange = useCallback((nextTab: LibraryTab) => {
    setSelectedTab(nextTab);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", nextTab);
      window.history.replaceState(null, "", url.toString());
    }

    dispatchLibraryTabChangeEvent(nextTab);
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
      setSelectedTab(getInitialLibraryTab());
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

      if (assetType === "ugc" || assetType === "demo" || assetType === "photo") {
        handleTabChange(getLibraryTabFromAssetType(assetType));
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
          title="Library"
          description="Browse saved clips, demos, avatars, Stitches, and Swipes."
        />
        {error ? (
          <DashboardAlert variant="error">{error}</DashboardAlert>
        ) : null}
        {avatarCreator.createdAvatar && avatarCreator.generatedCount ? (
          <DashboardAlert variant="success">
            Queued {avatarCreator.generatedCount} generated photos for{" "}
            {avatarCreator.createdAvatar.name}.
          </DashboardAlert>
        ) : null}
        {showUploadControls &&
        selectedTab !== "avatars" &&
        selectedTab !== "templates" &&
        selectedTab !== "pexels" ? (
          <UploadPanel
            allowedAssetTypes={["ugc", "demo"]}
            key={selectedTab}
            initialAssetType={getUploadAssetTypeFromLibraryTab(selectedTab)}
            isPhotoUploading={photoLibrary.isSaving}
            canUploadVideo={canUploadVideo}
            videoProductId={activeProductId}
            videoUploadBlockedMessage={videoUploadBlockedMessage}
            onDismiss={dispatchHideUploadControlsEvent}
            onAssetTypeChange={(assetType) =>
              handleTabChange(getLibraryTabFromAssetType(assetType))
            }
            onPhotoUploaded={photoLibrary.saveFiles}
            onUploaded={library.refresh}
          />
        ) : null}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <LibraryTabs value={selectedTab} onChange={handleTabChange} />
          <div
            className={[
              "grid w-full gap-3 sm:items-end",
              canSortSelectedTab
                ? "sm:grid-cols-2 lg:max-w-xl"
                : "lg:max-w-sm",
            ].join(" ")}
          >
            {canSortSelectedTab ? (
              <SelectInput
                label="Sort"
                options={sortOptions}
                value={library.sortOrder}
                onChange={(event) =>
                  library.setSortOrder(event.target.value as ClipLibrarySortOrder)
                }
              />
            ) : null}
            <SearchInput
              label="Search library"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={searchPlaceholder}
              className="w-full"
            />
          </div>
        </div>
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
            onScoreClip={library.scoreClip}
            onApplyQuickEdit={library.applyClipQuickEdit}
            onResetQuickEdit={library.resetClipQuickEdit}
            onUpdateCliprMusic={library.updateCliprMusic}
            onUpdateMetadata={library.updateClipMetadata}
            onUpdateCrop={library.updateClipCrop}
            onUpdateCuts={library.updateClipCuts}
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
            hookPlans={hookPlans.plans}
            savingHookPlanId={hookPlans.savingPlanId}
            savingIdeaStitchId={hookLabIdeaCreator.savingStitchId}
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
                    ? "No Stitches yet"
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
            onAcceptHookVariant={hookPlans.accept}
            onDelete={library.removeStitch}
            onLoadClip={library.loadClip}
            onLoadMoreItems={handleLoadMoreSelectedStitches}
            onLoadPoster={library.loadStitchPoster}
            onLoadVideo={library.loadStitchVideo}
            onPostBridgeScheduled={library.refresh}
            onSaveIdea={hookLabIdeaCreator.createIdeaFromStitch}
            onScore={library.scoreStitch}
            onApplyQuickEdit={library.applyStitchQuickEdit}
            onResetQuickEdit={library.resetStitchQuickEdit}
            onRejectHookVariant={hookPlans.reject}
            statusCounts={stitchStatusCounts}
            statusFilter={stitchStatusFilter}
            onStatusFilterChange={setStitchStatusFilter}
            onUpdateMusic={library.updateStitchMusic}
            onUpdatePostedStatus={library.updateStitchPostedStatus}
            onUpdateSocialCaption={library.updateStitchSocialCaption}
            onUpdateSourceCrop={library.updateStitchSourceCrop}
            onUpdateSourceCuts={library.updateStitchSourceCuts}
            onUpdateSourceSettings={library.updateStitchSourceSettings}
            onUpdateTextOverlay={library.updateStitchTextOverlay}
            onSelectHookVariant={hookPlans.selectOption}
            ugcClips={stitchrUgcClips}
          />
        ) : null}
        {selectedTab === "swipes" ? (
          <SwiprSwipesSection
            key={`swipes-${searchQuery}-${library.sortOrder}-${swipeStatusFilter}`}
            backgrounds={swiprLibrary.backgrounds}
            swipes={swipes}
            emptyTitle={
              hasSearchQuery
                ? "No matching Swipes"
                : swipeStatusFilter === "posted"
                  ? "No posted Swipes"
                  : swipeStatusFilter === "all"
                    ? "No carousel drafts yet"
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
            onPostBridgeScheduled={swiprLibrary.refresh}
            onStatusFilterChange={setSwipeStatusFilter}
            onUpdatePostedStatus={swiprLibrary.updateSwipePostedStatus}
          />
        ) : null}
        {selectedTab === "pexels" ? (
          <PexelsLibraryTabSection
            allBackgrounds={swiprLibrary.globalPexelsBackgrounds}
            isLoading={swiprLibrary.isLoading}
            mineBackgrounds={swiprLibrary.backgrounds}
            searchQuery={searchQuery}
            onAddPackToAccount={swiprLibrary.addLibraryPackToAccount}
            onLoadBackgroundBlob={swiprLibrary.loadBackgroundBlob}
            onRemovePackFromAccount={swiprLibrary.removeLibraryPackFromAccount}
            onRemovePhotoFromPack={(background) =>
              swiprLibrary.removeBackgroundFromLibraryPack(background.id)
            }
          />
        ) : null}
        {selectedTab === "avatars" ? (
          <AvatarLibraryTabSection
            searchQuery={searchQuery}
            showUploadControls={showUploadControls}
          />
        ) : null}
        {selectedTab === "templates" ? (
          <TemplateLibraryTabSection
            deletingTemplateId={stitchTemplates.deletingTemplateId}
            error={stitchTemplates.error}
            isLoading={stitchTemplates.isLoading}
            savingTemplateId={stitchTemplates.savingTemplateId}
            searchQuery={searchQuery}
            templates={stitchTemplates.templates}
            onDelete={stitchTemplates.deleteTemplate}
            onRename={stitchTemplates.renameTemplate}
          />
        ) : null}
      </div>
    </DashboardShell>
  );
}
