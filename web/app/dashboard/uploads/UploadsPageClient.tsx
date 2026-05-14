"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { LibraryPageHeader } from "@/app/_components/dashboard/LibraryPageHeader";
import { LongrVideosSection } from "@/app/_components/dashboard/LongrVideosSection";
import { StitchesSection } from "@/app/_components/dashboard/StitchesSection";
import { SwiprSwipesSection } from "@/app/_components/dashboard/SwiprSwipesSection";
import { UploadPanel } from "@/app/_components/dashboard/UploadPanel";
import { VideoLibrarySection } from "@/app/_components/dashboard/VideoLibrarySection";
import { ProductDemoUploadControls } from "@/app/_components/products/ProductDemoUploadControls";
import { ProductFilterSelect } from "@/app/_components/products/ProductFilterSelect";
import { UploadLibraryTabs } from "@/app/_components/uploads/UploadLibraryTabs";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import { SHOW_UPLOAD_CONTROLS_EVENT_NAME } from "@/lib/clipstitchr/constants/showUploadControlsEventName";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { useCreateAvatarFromUgcClip } from "@/lib/clipstitchr/hooks/useCreateAvatarFromUgcClip";
import { usePhotoLibrary } from "@/lib/clipstitchr/hooks/usePhotoLibrary";
import { useProducts } from "@/lib/clipstitchr/hooks/useProducts";
import { useShowUploadControls } from "@/lib/clipstitchr/hooks/useShowUploadControls";
import { useSwiprLibrary } from "@/lib/clipstitchr/hooks/useSwiprLibrary";
import type { CreateAvatarFromUgcClipOptions } from "@/lib/clipstitchr/types/CreateAvatarFromUgcClipOptions";
import type { UploadLibraryTab } from "@/lib/clipstitchr/types/UploadLibraryTab";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { filterClipsBySearchQuery } from "@/lib/clipstitchr/utils/filterClipsBySearchQuery";
import { filterClipsByDemoProductId } from "@/lib/clipstitchr/utils/filterClipsByDemoProductId";
import { filterClipsByType } from "@/lib/clipstitchr/utils/filterClipsByType";
import { filterCliprClips } from "@/lib/clipstitchr/utils/filterCliprClips";
import { filterLongrVideosByName } from "@/lib/clipstitchr/utils/filterLongrVideosByName";
import { filterStitchesByName } from "@/lib/clipstitchr/utils/filterStitchesByName";
import { filterSwipesBySearchQuery } from "@/lib/clipstitchr/utils/filterSwipesBySearchQuery";
import { filterSwaprClips } from "@/lib/clipstitchr/utils/filterSwaprClips";
import { filterPlainUgcClips } from "@/lib/clipstitchr/utils/filterPlainUgcClips";
import { dispatchHideUploadControlsEvent } from "@/lib/clipstitchr/utils/dispatchHideUploadControlsEvent";
import { getInitialUploadLibraryTab } from "@/lib/clipstitchr/utils/getInitialUploadLibraryTab";
import { getUploadAssetTypeFromLibraryTab } from "@/lib/clipstitchr/utils/getUploadAssetTypeFromLibraryTab";
import { getUploadLibraryTabFromAssetType } from "@/lib/clipstitchr/utils/getUploadLibraryTabFromAssetType";

type VideoLibraryTab = "ugc" | "clips" | "demo" | "swaps";

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
      "Upload hooks, reactions, b-roll, or creator footage to pair with demos.",
    sectionId: "ugc-clips",
    searchEmptyTitle: "No matching UGC",
    searchEmptyDescription:
      "No saved UGC matches that title or tag.",
  },
  clips: {
    title: "Clips",
    emptyTitle: "No Clips yet",
    emptyDescription:
      "Generate Clipr Clips to create more reusable engagement footage.",
    sectionId: "clips",
    searchEmptyTitle: "No matching Clips",
    searchEmptyDescription:
      "No saved Clipr Clips match that title or tag.",
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
  const [demoProductFilterId, setDemoProductFilterId] = useState("all");
  const [demoUploadProductId, setDemoUploadProductId] = useState("");
  const productIds = useMemo(
    () => new Set(products.products.map((product) => product.id)),
    [products.products],
  );
  const activeDemoProductFilterId =
    demoProductFilterId === "all" || productIds.has(demoProductFilterId)
      ? demoProductFilterId
      : "all";
  const activeDemoUploadProductId = productIds.has(demoUploadProductId)
    ? demoUploadProductId
    : (products.products[0]?.id ?? "");
  const searchFilteredClips = useMemo(
    () => filterClipsBySearchQuery(library.clips, searchQuery),
    [library.clips, searchQuery],
  );
  const ugcClips = useMemo(
    () => filterPlainUgcClips(searchFilteredClips),
    [searchFilteredClips],
  );
  const cliprClips = useMemo(
    () => filterCliprClips(searchFilteredClips),
    [searchFilteredClips],
  );
  const allDemoClips = useMemo(
    () => filterClipsByType(searchFilteredClips, "demo"),
    [searchFilteredClips],
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
    () => filterSwaprClips(searchFilteredClips),
    [searchFilteredClips],
  );
  const stitches = useMemo(
    () => filterStitchesByName(library.stitches, searchQuery),
    [library.stitches, searchQuery],
  );
  const longrVideos = useMemo(
    () => filterLongrVideosByName(library.longrVideos, searchQuery),
    [library.longrVideos, searchQuery],
  );
  const swipes = useMemo(
    () => filterSwipesBySearchQuery(swiprLibrary.swipes, searchQuery),
    [searchQuery, swiprLibrary.swipes],
  );
  const hasSearchQuery = searchQuery.trim().length > 0;
  const error = library.error ?? swiprLibrary.error ?? products.error;
  const hasDemoProductFilter =
    selectedTab === "demo" && activeDemoProductFilterId !== "all";
  const canUploadDemo =
    products.products.length > 0 && activeDemoUploadProductId.length > 0;
  const demoUploadBlockedMessage = products.isLoading
    ? "Products are loading."
    : "Create a product in Settings before uploading demo videos.";
  const selectedVideoSection =
    selectedTab === "ugc"
      ? { clips: ugcClips, content: videoLibraryContent.ugc }
      : selectedTab === "clips"
        ? { clips: cliprClips, content: videoLibraryContent.clips }
        : selectedTab === "demo"
          ? { clips: demoClips, content: videoLibraryContent.demo }
          : selectedTab === "swaps"
            ? { clips: swapClips, content: videoLibraryContent.swaps }
            : null;

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
          description="Keep UGC, product demos, Clips, swaps, Swipes, stitches, and Longs ready for the next export."
        />
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {avatarCreator.createdAvatar && avatarCreator.generatedCount ? (
          <div className="rounded-lg border border-accent/25 bg-surface-muted p-4 text-sm font-semibold text-accent-dark">
            Saved {avatarCreator.generatedCount} generated photos for{" "}
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
                ? "sm:grid-cols-2 lg:max-w-xl"
                : "lg:max-w-sm",
            ].join(" ")}
          >
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
              key={`all-ugc-${searchQuery}`}
              id={videoLibraryContent.ugc.sectionId}
              title={videoLibraryContent.ugc.title}
              clips={ugcClips}
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
              onLoadClip={library.loadClip}
              isCreatingAvatarFromClip={avatarCreator.isGenerating}
              onDelete={library.removeClip}
              onGenerateCliprMusic={library.generateCliprMusic}
              onUpdateCliprMusic={library.updateCliprMusic}
              onUpdateMetadata={library.updateClipMetadata}
              onUpdateTrim={library.updateClipTrimRange}
              onCreateAvatarFromClip={handleCreateAvatarFromClip}
            />
            <VideoLibrarySection
              key={`all-clips-${searchQuery}`}
              id={videoLibraryContent.clips.sectionId}
              title={videoLibraryContent.clips.title}
              clips={cliprClips}
              products={products.products}
              emptyTitle={
                hasSearchQuery
                  ? videoLibraryContent.clips.searchEmptyTitle
                  : videoLibraryContent.clips.emptyTitle
              }
              emptyDescription={
                hasSearchQuery
                  ? videoLibraryContent.clips.searchEmptyDescription
                  : videoLibraryContent.clips.emptyDescription
              }
              onLoadClip={library.loadClip}
              onDelete={library.removeClip}
              onGenerateCliprMusic={library.generateCliprMusic}
              onUpdateCliprMusic={library.updateCliprMusic}
              onUpdateMetadata={library.updateClipMetadata}
              onUpdateTrim={library.updateClipTrimRange}
            />
            <VideoLibrarySection
              key={`all-demo-${searchQuery}`}
              id={videoLibraryContent.demo.sectionId}
              title={videoLibraryContent.demo.title}
              clips={demoClips}
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
              onLoadClip={library.loadClip}
              onDelete={library.removeClip}
              onGenerateCliprMusic={library.generateCliprMusic}
              onUpdateCliprMusic={library.updateCliprMusic}
              onUpdateMetadata={library.updateClipMetadata}
              onUpdateTrim={library.updateClipTrimRange}
            />
            <VideoLibrarySection
              key={`all-swaps-${searchQuery}`}
              id={videoLibraryContent.swaps.sectionId}
              title={videoLibraryContent.swaps.title}
              clips={swapClips}
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
              onLoadClip={library.loadClip}
              onDelete={library.removeClip}
              onGenerateCliprMusic={library.generateCliprMusic}
              onUpdateCliprMusic={library.updateCliprMusic}
              onUpdateMetadata={library.updateClipMetadata}
              onUpdateTrim={library.updateClipTrimRange}
            />
            <StitchesSection
              key={`all-stitches-${searchQuery}`}
              stitches={stitches}
              emptyTitle={hasSearchQuery ? "No matching stitches" : undefined}
              emptyDescription={
                hasSearchQuery
                  ? "No stitches match that name."
                  : undefined
              }
              onDelete={library.removeStitch}
              onGenerateMusic={library.generateStitchMusic}
              onLoadClip={library.loadClip}
              onUpdateMusic={library.updateStitchMusic}
              onUpdateTextOverlay={library.updateStitchTextOverlay}
            />
            <LongrVideosSection
              key={`all-longr-${searchQuery}`}
              longrVideos={longrVideos}
              emptyTitle={hasSearchQuery ? "No matching Longs" : undefined}
              emptyDescription={
                hasSearchQuery
                  ? "No Longs match that name."
                  : undefined
              }
              onDelete={library.removeLongrVideo}
            />
            <SwiprSwipesSection
              key={`all-swipes-${searchQuery}`}
              backgrounds={swiprLibrary.backgrounds}
              swipes={swipes}
              emptyTitle={hasSearchQuery ? "No matching Swipes" : undefined}
              emptyDescription={
                hasSearchQuery
                  ? "No saved Swipes match that search."
                  : undefined
              }
              onLoadBackgroundBlob={swiprLibrary.loadBackgroundBlob}
              onDelete={swiprLibrary.removeSwipe}
            />
          </div>
        ) : null}
        {selectedVideoSection ? (
          <VideoLibrarySection
            key={`${selectedTab}-${searchQuery}`}
            id={selectedVideoSection.content.sectionId}
            title={selectedVideoSection.content.title}
            clips={selectedVideoSection.clips}
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
            onLoadClip={library.loadClip}
            isCreatingAvatarFromClip={
              selectedTab === "ugc" && avatarCreator.isGenerating
            }
            onDelete={library.removeClip}
            onGenerateCliprMusic={library.generateCliprMusic}
            onUpdateCliprMusic={library.updateCliprMusic}
            onUpdateMetadata={library.updateClipMetadata}
            onUpdateTrim={library.updateClipTrimRange}
            onCreateAvatarFromClip={
              selectedTab === "ugc" ? handleCreateAvatarFromClip : undefined
            }
          />
        ) : null}
        {selectedTab === "stitches" ? (
          <StitchesSection
            key={`stitches-${searchQuery}`}
            stitches={stitches}
            emptyTitle={hasSearchQuery ? "No matching stitches" : undefined}
            emptyDescription={
              hasSearchQuery
                ? "No stitches match that name."
                : undefined
            }
            onDelete={library.removeStitch}
            onGenerateMusic={library.generateStitchMusic}
            onLoadClip={library.loadClip}
            onUpdateMusic={library.updateStitchMusic}
            onUpdateTextOverlay={library.updateStitchTextOverlay}
          />
        ) : null}
        {selectedTab === "longr" ? (
          <LongrVideosSection
            key={`longr-${searchQuery}`}
            longrVideos={longrVideos}
            emptyTitle={hasSearchQuery ? "No matching Longs" : undefined}
            emptyDescription={
              hasSearchQuery
                ? "No Longs match that name."
                : undefined
            }
            onDelete={library.removeLongrVideo}
          />
        ) : null}
        {selectedTab === "swipes" ? (
          <SwiprSwipesSection
            key={`swipes-${searchQuery}`}
            backgrounds={swiprLibrary.backgrounds}
            swipes={swipes}
            emptyTitle={hasSearchQuery ? "No matching Swipes" : undefined}
            emptyDescription={
              hasSearchQuery
                ? "No saved Swipes match that search."
                : undefined
            }
            onLoadBackgroundBlob={swiprLibrary.loadBackgroundBlob}
            onDelete={swiprLibrary.removeSwipe}
          />
        ) : null}
      </div>
    </DashboardShell>
  );
}
