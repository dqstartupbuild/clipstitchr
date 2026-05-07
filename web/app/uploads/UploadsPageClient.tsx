"use client";

import { useMemo, useState } from "react";
import { ClipTypeTabs } from "@/app/_components/dashboard/ClipTypeTabs";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { LibraryPageHeader } from "@/app/_components/dashboard/LibraryPageHeader";
import { UploadPanel } from "@/app/_components/dashboard/UploadPanel";
import { VideoLibrarySection } from "@/app/_components/dashboard/VideoLibrarySection";
import { useClipLibrary } from "@/lib/clipr/hooks/useClipLibrary";
import { useShowUploadControls } from "@/lib/clipr/hooks/useShowUploadControls";
import type { ClipType } from "@/lib/clipr/types/ClipType";
import { filterClipsByType } from "@/lib/clipr/utils/filterClipsByType";

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
  const showUploadControls = useShowUploadControls();
  const [selectedClipType, setSelectedClipType] = useState<ClipType>("ugc");
  const selectedContent = uploadLibraryContent[selectedClipType];
  const clips = useMemo(
    () => filterClipsByType(library.clips, selectedClipType),
    [library.clips, selectedClipType],
  );

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <LibraryPageHeader
          eyebrow="Library"
          title="Uploads"
          description="Browse normalized UGC clips and demo videos saved in this browser."
        />
        {library.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {library.error}
          </div>
        ) : null}
        {showUploadControls ? <UploadPanel onUploaded={library.refresh} /> : null}
        <div>
          <ClipTypeTabs
            value={selectedClipType}
            onChange={setSelectedClipType}
          />
        </div>
        <VideoLibrarySection
          id={selectedContent.sectionId}
          title={selectedContent.title}
          clips={clips}
          emptyDescription={selectedContent.emptyDescription}
          onDelete={library.removeClip}
          onRename={library.renameClip}
        />
      </div>
    </DashboardShell>
  );
}
