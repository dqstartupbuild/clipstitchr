"use client";

import { useMemo, useState } from "react";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { LongrBuildResult } from "@/app/_components/longr/LongrBuildResult";
import { LongrClipPickerPanel } from "@/app/_components/longr/LongrClipPickerPanel";
import { LongrMusicPanel } from "@/app/_components/longr/LongrMusicPanel";
import { LongrPreviewPanel } from "@/app/_components/longr/LongrPreviewPanel";
import { LongrProgressPanel } from "@/app/_components/longr/LongrProgressPanel";
import { LongrTimelineStrip } from "@/app/_components/longr/LongrTimelineStrip";
import { longrMaxDurationSeconds } from "@/lib/clipstitchr/constants/longrMaxDurationSeconds";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { useLongr } from "@/lib/clipstitchr/hooks/useLongr";
import { useProducts } from "@/lib/clipstitchr/hooks/useProducts";
import type { LongrBuildClipSelection } from "@/lib/clipstitchr/types/LongrBuildClipSelection";
import type { LongrMusicClip } from "@/lib/clipstitchr/types/LongrMusicClip";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { clampLongrMusicClip } from "@/lib/clipstitchr/utils/clampLongrMusicClip";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { createLongrMusicClip } from "@/lib/clipstitchr/utils/createLongrMusicClip";
import { filterClipsByDemoProductId } from "@/lib/clipstitchr/utils/filterClipsByDemoProductId";
import { filterClipsByType } from "@/lib/clipstitchr/utils/filterClipsByType";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getLongrTotalDuration } from "@/lib/clipstitchr/utils/getLongrTotalDuration";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

export function LongrPageClient() {
  const library = useClipLibrary();
  const products = useProducts();
  const longr = useLongr({ onCreated: library.refresh });
  const [selectedClipIds, setSelectedClipIds] = useState<string[]>([]);
  const [demoProductFilterId, setDemoProductFilterId] = useState("all");
  const [musicClips, setMusicClips] = useState<LongrMusicClip[]>([]);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const ugcClips = useMemo(
    () => filterClipsByType(library.clips, "ugc"),
    [library.clips],
  );
  const demoClips = useMemo(
    () => filterClipsByType(library.clips, "demo"),
    [library.clips],
  );
  const productIds = useMemo(
    () => new Set(products.products.map((product) => product.id)),
    [products.products],
  );
  const activeDemoProductFilterId =
    demoProductFilterId === "all" || productIds.has(demoProductFilterId)
      ? demoProductFilterId
      : "all";
  const availableClips = useMemo(
    () => [...ugcClips, ...demoClips],
    [demoClips, ugcClips],
  );
  const visibleAvailableClips = useMemo(
    () =>
      filterClipsByDemoProductId(
        availableClips,
        activeDemoProductFilterId,
      ),
    [activeDemoProductFilterId, availableClips],
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
      setSelectionError("Longs cannot be longer than 5 minutes.");
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

    void longr.buildLongrVideo(selections, musicClips);
  };
  const handleAddMusicTrack = (track: SharedMusicTrack) => {
    setMusicClips((currentClips) => [
      ...currentClips,
      createLongrMusicClip({
        timelineDurationSeconds: selectedDuration,
        track,
      }),
    ]);
  };
  const handleUpdateMusicClip = (
    id: string,
    patch: Partial<LongrMusicClip>,
  ) => {
    setMusicClips((currentClips) =>
      currentClips.map((clip) =>
        clip.id === id
          ? clampLongrMusicClip({
              clip: {
                ...clip,
                ...patch,
              },
              timelineDurationSeconds: selectedDuration,
            })
          : clip,
      ),
    );
  };
  const handleDuplicateMusicClip = (id: string) => {
    setMusicClips((currentClips) => {
      const clip = currentClips.find((currentClip) => currentClip.id === id);

      if (!clip) {
        return currentClips;
      }

      return [
        ...currentClips,
        clampLongrMusicClip({
          clip: {
            ...clip,
            id: createId(),
            timelineStartSeconds: clip.timelineStartSeconds + 1,
          },
          timelineDurationSeconds: selectedDuration,
        }),
      ];
    });
  };
  const handleRemoveMusicClip = (id: string) => {
    setMusicClips((currentClips) =>
      currentClips.filter((clip) => clip.id !== id),
    );
  };

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DashboardPageHeader
          eyebrow="Longr"
          title="Longr"
          description="Build one vertical long-form video from multiple UGC and demo clips in the order you choose."
        />
        {library.error || products.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {library.error ?? products.error}
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
              clips={visibleAvailableClips}
              duration={selectedDuration}
              products={products.products}
              demoProductFilterId={activeDemoProductFilterId}
              hasMoreClips={library.hasMoreClips}
              isBuilding={isBuilding}
              isLoadingMoreClips={library.isLoadingMoreClips}
              selectedClipIds={selectedClipIds}
              onAddClip={handleAddClip}
              onBuild={handleBuild}
              onDemoProductFilterChange={setDemoProductFilterId}
              onLoadMoreClips={library.loadMoreClips}
              onLoadPoster={library.loadClipPoster}
              onRemoveClip={handleRemoveClip}
            />
            <LongrTimelineStrip
              clips={selectedClips}
              onLoadPoster={library.loadClipPoster}
              onMoveClip={handleMoveClip}
              onRemoveClip={handleRemoveClip}
            />
            <LongrMusicPanel
              isBuilding={isBuilding}
              musicClips={musicClips}
              onAddTrack={handleAddMusicTrack}
              onDuplicate={handleDuplicateMusicClip}
              onRemove={handleRemoveMusicClip}
              onUpdate={handleUpdateMusicClip}
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
