"use client";

import { useMemo, useState } from "react";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { LibraryPageHeader } from "@/app/_components/dashboard/LibraryPageHeader";
import { UploadPanel } from "@/app/_components/dashboard/UploadPanel";
import { VideoLibrarySection } from "@/app/_components/dashboard/VideoLibrarySection";
import { PhotoLibrarySection } from "@/app/_components/uploads/PhotoLibrarySection";
import { UploadLibraryTabs } from "@/app/_components/uploads/UploadLibraryTabs";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { usePhotoLibrary } from "@/lib/clipstitchr/hooks/usePhotoLibrary";
import { useShowUploadControls } from "@/lib/clipstitchr/hooks/useShowUploadControls";
import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { UploadLibraryTab } from "@/lib/clipstitchr/types/UploadLibraryTab";
import { filterClipsByName } from "@/lib/clipstitchr/utils/filterClipsByName";
import { filterClipsByType } from "@/lib/clipstitchr/utils/filterClipsByType";
import { filterPhotosByName } from "@/lib/clipstitchr/utils/filterPhotosByName";
import { getInitialUploadLibraryTab } from "@/lib/clipstitchr/utils/getInitialUploadLibraryTab";
import { getUploadAssetTypeFromLibraryTab } from "@/lib/clipstitchr/utils/getUploadAssetTypeFromLibraryTab";
import { getUploadLibraryTabFromAssetType } from "@/lib/clipstitchr/utils/getUploadLibraryTabFromAssetType";

const uploadLibraryContent: Record<
  ClipType,
  {
    title: string;
    emptyDescription: string;
    sectionId: string;
  }
> = {
  ugc: {
    title: "UGC Clips",
    emptyDescription:
      "Upload reaction clips from the dashboard and classify them as UGC.",
    sectionId: "ugc-clips",
  },
  demo: {
    title: "Demo Videos",
    emptyDescription:
      "Upload product walkthroughs from the dashboard and classify them as Demo.",
    sectionId: "demo-videos",
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
  const selectedClipType: ClipType = selectedTab === "demo" ? "demo" : "ugc";
  const selectedContent = uploadLibraryContent[selectedClipType];
  const searchFilteredClips = useMemo(
    () => filterClipsByName(library.clips, searchQuery),
    [library.clips, searchQuery],
  );
  const clips = useMemo(
    () => filterClipsByType(searchFilteredClips, selectedClipType),
    [searchFilteredClips, selectedClipType],
  );
  const photos = useMemo(
    () => filterPhotosByName(photoLibrary.photos, searchQuery),
    [photoLibrary.photos, searchQuery],
  );
  const hasSearchQuery = searchQuery.trim().length > 0;
  const error = library.error ?? photoLibrary.error;

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
          title="Uploads"
          description="Browse saved UGC clips, demo videos, and Swapr photos in this browser."
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
            label="Search uploads"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search uploads"
            className="w-full sm:max-w-sm"
          />
        </div>
        {selectedTab === "photos" ? (
          <PhotoLibrarySection
            key={`photos-${searchQuery}`}
            id="photos"
            photos={photos}
            emptyTitle={hasSearchQuery ? "No matching photos" : undefined}
            emptyDescription={
              hasSearchQuery
                ? "No saved photos match that name."
                : "Upload person photos here so they can be selected in Swapr."
            }
            onDelete={photoLibrary.removePhoto}
          />
        ) : (
          <VideoLibrarySection
            key={`${selectedClipType}-${searchQuery}`}
            id={selectedContent.sectionId}
            title={selectedContent.title}
            clips={clips}
            emptyTitle={hasSearchQuery ? "No matching videos" : undefined}
            emptyDescription={
              hasSearchQuery
                ? "No saved videos in this tab match that name."
                : selectedContent.emptyDescription
            }
            onDelete={library.removeClip}
            onRename={library.renameClip}
            onUpdateTrim={library.updateClipTrimRange}
          />
        )}
      </div>
    </DashboardShell>
  );
}
