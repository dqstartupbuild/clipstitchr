"use client";

import { useMemo, useState } from "react";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { LibraryPageHeader } from "@/app/_components/dashboard/LibraryPageHeader";
import { StitchesSection } from "@/app/_components/dashboard/StitchesSection";
import { UploadPanel } from "@/app/_components/dashboard/UploadPanel";
import { VideoLibrarySection } from "@/app/_components/dashboard/VideoLibrarySection";
import { PhotoLibrarySection } from "@/app/_components/uploads/PhotoLibrarySection";
import { UploadLibraryTabs } from "@/app/_components/uploads/UploadLibraryTabs";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { usePhotoLibrary } from "@/lib/clipstitchr/hooks/usePhotoLibrary";
import { useShowUploadControls } from "@/lib/clipstitchr/hooks/useShowUploadControls";
import type { UploadLibraryTab } from "@/lib/clipstitchr/types/UploadLibraryTab";
import { filterClipsBySearchQuery } from "@/lib/clipstitchr/utils/filterClipsBySearchQuery";
import { filterClipsByType } from "@/lib/clipstitchr/utils/filterClipsByType";
import { filterNonSwaprClips } from "@/lib/clipstitchr/utils/filterNonSwaprClips";
import { filterPhotosBySearchQuery } from "@/lib/clipstitchr/utils/filterPhotosBySearchQuery";
import { filterStitchesByName } from "@/lib/clipstitchr/utils/filterStitchesByName";
import { filterSwaprClips } from "@/lib/clipstitchr/utils/filterSwaprClips";
import { getInitialUploadLibraryTab } from "@/lib/clipstitchr/utils/getInitialUploadLibraryTab";
import { getUploadAssetTypeFromLibraryTab } from "@/lib/clipstitchr/utils/getUploadAssetTypeFromLibraryTab";
import { getUploadLibraryTabFromAssetType } from "@/lib/clipstitchr/utils/getUploadLibraryTabFromAssetType";

type VideoLibraryTab = "ugc" | "demo" | "swaps";

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
    title: "UGC Clips",
    emptyTitle: "No UGC clips yet",
    emptyDescription:
      "Upload source clips from the dashboard and classify them as UGC.",
    sectionId: "ugc-clips",
    searchEmptyTitle: "No matching UGC clips",
    searchEmptyDescription:
      "No saved UGC clips match that title or tag.",
  },
  demo: {
    title: "Demo Videos",
    emptyTitle: "No demo videos yet",
    emptyDescription:
      "Upload product walkthroughs from the dashboard and classify them as Demo.",
    sectionId: "demo-videos",
    searchEmptyTitle: "No matching demo videos",
    searchEmptyDescription:
      "No saved demo videos match that title or tag.",
  },
  swaps: {
    title: "Swaps",
    emptyTitle: "No swaps yet",
    emptyDescription:
      "Generate a Swapr video to save it here as a reusable UGC output.",
    sectionId: "swaps",
    searchEmptyTitle: "No matching swaps",
    searchEmptyDescription:
      "No saved Swapr outputs match that title or tag.",
  },
};

export function UploadsPageClient() {
  const library = useClipLibrary();
  const photoLibrary = usePhotoLibrary();
  const showUploadControls = useShowUploadControls();
  const [selectedTab, setSelectedTab] = useState<UploadLibraryTab>(
    getInitialUploadLibraryTab,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const searchFilteredClips = useMemo(
    () => filterClipsBySearchQuery(library.clips, searchQuery),
    [library.clips, searchQuery],
  );
  const nonSwaprClips = useMemo(
    () => filterNonSwaprClips(searchFilteredClips),
    [searchFilteredClips],
  );
  const ugcClips = useMemo(
    () => filterClipsByType(nonSwaprClips, "ugc"),
    [nonSwaprClips],
  );
  const demoClips = useMemo(
    () => filterClipsByType(nonSwaprClips, "demo"),
    [nonSwaprClips],
  );
  const swapClips = useMemo(
    () => filterSwaprClips(searchFilteredClips),
    [searchFilteredClips],
  );
  const photos = useMemo(
    () => filterPhotosBySearchQuery(photoLibrary.photos, searchQuery),
    [photoLibrary.photos, searchQuery],
  );
  const stitches = useMemo(
    () => filterStitchesByName(library.stitches, searchQuery),
    [library.stitches, searchQuery],
  );
  const hasSearchQuery = searchQuery.trim().length > 0;
  const error = library.error ?? photoLibrary.error;
  const selectedVideoSection =
    selectedTab === "ugc"
      ? { clips: ugcClips, content: videoLibraryContent.ugc }
      : selectedTab === "demo"
        ? { clips: demoClips, content: videoLibraryContent.demo }
        : selectedTab === "swaps"
          ? { clips: swapClips, content: videoLibraryContent.swaps }
          : null;

  const handleTabChange = (nextTab: UploadLibraryTab) => {
    setSelectedTab(nextTab);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", nextTab);
      window.history.replaceState(null, "", url.toString());
    }
  };

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <LibraryPageHeader
          eyebrow="Library"
          title="Content Library"
          description="Browse saved UGC clips, demo videos, photos, Swapr outputs, and stitches in one place."
        />
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {showUploadControls ? (
          <UploadPanel
            key={selectedTab}
            initialAssetType={getUploadAssetTypeFromLibraryTab(selectedTab)}
            isPhotoUploading={photoLibrary.isSaving}
            onAssetTypeChange={(assetType) =>
              handleTabChange(getUploadLibraryTabFromAssetType(assetType))
            }
            onPhotoUploaded={photoLibrary.saveFiles}
            onUploaded={library.refresh}
          />
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <UploadLibraryTabs value={selectedTab} onChange={handleTabChange} />
          <SearchInput
            label="Search library"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search library"
            className="w-full sm:max-w-sm"
          />
        </div>
        {selectedTab === "all" ? (
          <div className="flex flex-col gap-8">
            <VideoLibrarySection
              key={`all-ugc-${searchQuery}`}
              id={videoLibraryContent.ugc.sectionId}
              title={videoLibraryContent.ugc.title}
              clips={ugcClips}
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
              onDelete={library.removeClip}
              onUpdateMetadata={library.updateClipMetadata}
              onUpdateTrim={library.updateClipTrimRange}
            />
            <VideoLibrarySection
              key={`all-demo-${searchQuery}`}
              id={videoLibraryContent.demo.sectionId}
              title={videoLibraryContent.demo.title}
              clips={demoClips}
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
              onUpdateMetadata={library.updateClipMetadata}
              onUpdateTrim={library.updateClipTrimRange}
            />
            <PhotoLibrarySection
              key={`all-photos-${searchQuery}`}
              id="photos"
              photos={photos}
              emptyTitle={hasSearchQuery ? "No matching photos" : undefined}
              emptyDescription={
                hasSearchQuery
                  ? "No saved photos match that title or tag."
                  : "Upload person photos here so they can be selected in Swapr."
              }
              onLoadPhoto={photoLibrary.loadPhoto}
              onDelete={photoLibrary.removePhoto}
              onUpdateMetadata={photoLibrary.updatePhotoMetadata}
            />
            <VideoLibrarySection
              key={`all-swaps-${searchQuery}`}
              id={videoLibraryContent.swaps.sectionId}
              title={videoLibraryContent.swaps.title}
              clips={swapClips}
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
            />
          </div>
        ) : null}
        {selectedTab === "photos" ? (
          <PhotoLibrarySection
            key={`photos-${searchQuery}`}
            id="photos"
            photos={photos}
            emptyTitle={hasSearchQuery ? "No matching photos" : undefined}
            emptyDescription={
              hasSearchQuery
                ? "No saved photos match that title or tag."
                : "Upload person photos here so they can be selected in Swapr."
            }
            onLoadPhoto={photoLibrary.loadPhoto}
            onDelete={photoLibrary.removePhoto}
            onUpdateMetadata={photoLibrary.updatePhotoMetadata}
          />
        ) : null}
        {selectedVideoSection ? (
          <VideoLibrarySection
            key={`${selectedTab}-${searchQuery}`}
            id={selectedVideoSection.content.sectionId}
            title={selectedVideoSection.content.title}
            clips={selectedVideoSection.clips}
            emptyTitle={
              hasSearchQuery
                ? selectedVideoSection.content.searchEmptyTitle
                : selectedVideoSection.content.emptyTitle
            }
            emptyDescription={
              hasSearchQuery
                ? selectedVideoSection.content.searchEmptyDescription
                : selectedVideoSection.content.emptyDescription
            }
            onLoadClip={library.loadClip}
            onDelete={library.removeClip}
            onUpdateMetadata={library.updateClipMetadata}
            onUpdateTrim={library.updateClipTrimRange}
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
          />
        ) : null}
      </div>
    </DashboardShell>
  );
}
