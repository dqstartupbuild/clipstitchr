"use client";

import { useMemo, useState } from "react";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { LongrBuildResult } from "@/app/_components/longr/LongrBuildResult";
import { LongrClipPickerPanel } from "@/app/_components/longr/LongrClipPickerPanel";
import { LongrPreviewPanel } from "@/app/_components/longr/LongrPreviewPanel";
import { LongrProgressPanel } from "@/app/_components/longr/LongrProgressPanel";
import { LongrTimelineStrip } from "@/app/_components/longr/LongrTimelineStrip";
import { longrMaxDurationSeconds } from "@/lib/clipstitchr/constants/longrMaxDurationSeconds";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { useLongr } from "@/lib/clipstitchr/hooks/useLongr";
import type { LongrBuildClipSelection } from "@/lib/clipstitchr/types/LongrBuildClipSelection";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { filterClipsByType } from "@/lib/clipstitchr/utils/filterClipsByType";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getLongrTotalDuration } from "@/lib/clipstitchr/utils/getLongrTotalDuration";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

export function LongrPageClient() {
  const library = useClipLibrary();
  const longr = useLongr({ onCreated: library.refresh });
  const [selectedClipIds, setSelectedClipIds] = useState<string[]>([]);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const ugcClips = useMemo(
    () => filterClipsByType(library.clips, "ugc"),
    [library.clips],
  );
  const demoClips = useMemo(
    () => filterClipsByType(library.clips, "demo"),
    [library.clips],
  );
  const availableClips = useMemo(
    () => [...ugcClips, ...demoClips],
    [demoClips, ugcClips],
  );
  const selectedClips = useMemo(
    () =>
      selectedClipIds
        .map((id) => availableClips.find((clip) => clip.id === id))
        .filter((clip): clip is VideoClipMetadata => Boolean(clip)),
    [availableClips, selectedClipIds],
  );
  const selectedDuration = useMemo(
    () => getLongrTotalDuration(selectedClips),
    [selectedClips],
  );
  const isBuilding =
    longr.status === "reading" ||
    longr.status === "stitching" ||
    longr.status === "saving";

  const handleAddClip = (clip: VideoClipMetadata) => {
    if (selectedClipIds.includes(clip.id)) {
      return;
    }

    const clipDuration = getVideoTrimRangeDuration(
      getDefaultVideoTrimRange(clip),
    );

    if (selectedDuration + clipDuration > longrMaxDurationSeconds) {
      setSelectionError("Longr videos cannot be longer than 5 minutes.");
      return;
    }

    setSelectionError(null);
    setSelectedClipIds((currentIds) => [...currentIds, clip.id]);
  };
  const handleRemoveClip = (id: string) => {
    setSelectionError(null);
    setSelectedClipIds((currentIds) =>
      currentIds.filter((currentId) => currentId !== id),
    );
  };
  const handleMoveClip = (draggedId: string, targetId: string) => {
    setSelectedClipIds((currentIds) => {
      const draggedIndex = currentIds.indexOf(draggedId);
      const targetIndex = currentIds.indexOf(targetId);

      if (draggedIndex === -1 || targetIndex === -1) {
        return currentIds;
      }

      const nextIds = [...currentIds];
      const insertIndex =
        draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;

      nextIds.splice(draggedIndex, 1);
      nextIds.splice(insertIndex, 0, draggedId);
      return nextIds;
    });
  };
  const handleBuild = () => {
    const selections: LongrBuildClipSelection[] = selectedClips.map((clip) => ({
      clip,
      trimRange: getDefaultVideoTrimRange(clip),
      loadClip: () => library.loadClip(clip.id),
    }));

    void longr.buildLongrVideo(selections);
  };

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DashboardPageHeader
          eyebrow="Longr"
          title="Longr"
          description="Build one vertical long-form video from multiple UGC and demo clips in the order you choose."
        />
        {library.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {library.error}
          </div>
        ) : null}
        {selectionError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {selectionError}
          </div>
        ) : null}
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div className="flex min-w-0 flex-col gap-5">
            <LongrClipPickerPanel
              clips={availableClips}
              duration={selectedDuration}
              isBuilding={isBuilding}
              selectedClipIds={selectedClipIds}
              onAddClip={handleAddClip}
              onBuild={handleBuild}
              onRemoveClip={handleRemoveClip}
            />
            <LongrTimelineStrip
              clips={selectedClips}
              onMoveClip={handleMoveClip}
              onRemoveClip={handleRemoveClip}
            />
            <LongrProgressPanel
              status={longr.status}
              progress={longr.progress}
              error={longr.error}
            />
            <LongrBuildResult longrVideo={longr.longrVideo} />
          </div>
          <div className="min-w-0 w-full max-w-[360px] justify-self-center xl:sticky xl:top-5 xl:justify-self-end">
            <LongrPreviewPanel
              clips={selectedClips}
              onLoadClip={library.loadClip}
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
