"use client";

import { useCallback, useMemo, useState } from "react";
import { ClipPickerPanel } from "@/app/_components/stitchr/ClipPickerPanel";
import { StitchrProgressPanel } from "@/app/_components/stitchr/StitchrProgressPanel";
import { StitchrEmptyState } from "@/app/_components/stitchr/StitchrEmptyState";
import { StitchrHeader } from "@/app/_components/stitchr/StitchrHeader";
import { StitchrShell } from "@/app/_components/stitchr/StitchrShell";
import { DownloadStitchesPanel } from "@/app/_components/stitchr/DownloadStitchesPanel";
import { SequencePreviewPanel } from "@/app/_components/stitchr/SequencePreviewPanel";
import { maxStitchrUgcSelectionCount } from "@/lib/clipstitchr/constants/maxStitchrUgcSelectionCount";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { useLoadedVideoClip } from "@/lib/clipstitchr/hooks/useLoadedVideoClip";
import { useStitchr } from "@/lib/clipstitchr/hooks/useStitchr";
import type { StitchrUgcSelection } from "@/lib/clipstitchr/types/StitchrUgcSelection";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { filterClipsByType } from "@/lib/clipstitchr/utils/filterClipsByType";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";
import { toggleStitchrUgcSelection } from "@/lib/clipstitchr/utils/toggleStitchrUgcSelection";

export function StitchrPageClient() {
  const library = useClipLibrary();
  const stitchrState = useStitchr({ onCreated: library.refresh });
  const [textOverlay, setTextOverlay] = useState<TextOverlay | null>(null);
  const [ugcTrimRangesByClipId, setUgcTrimRangesByClipId] = useState<
    Record<string, VideoTrimRange>
  >({});
  const [demoTrimRangesByClipId, setDemoTrimRangesByClipId] = useState<
    Record<string, VideoTrimRange>
  >({});
  const loadClip = library.loadClip;
  const ugcClips = useMemo(
    () => filterClipsByType(library.clips, "ugc"),
    [library.clips],
  );
  const demoClips = useMemo(
    () => filterClipsByType(library.clips, "demo"),
    [library.clips],
  );
  const [selectedUgcIds, setSelectedUgcIds] = useState<string[] | undefined>();
  const [activePreviewUgcId, setActivePreviewUgcId] = useState<
    string | undefined
  >();
  const [selectedDemoId, setSelectedDemoId] = useState<
    string | null | undefined
  >();
  const activeSelectedUgcIds = useMemo(() => {
    const validUgcIds = new Set(ugcClips.map((clip) => clip.id));
    const nextSelectedIds =
      selectedUgcIds === undefined
        ? ugcClips[0]
          ? [ugcClips[0].id]
          : []
        : selectedUgcIds;

    return nextSelectedIds
      .filter((id) => validUgcIds.has(id))
      .slice(0, maxStitchrUgcSelectionCount);
  }, [selectedUgcIds, ugcClips]);
  const activeDemoId =
    selectedDemoId === undefined ? (demoClips[0]?.id ?? null) : selectedDemoId;
  const activeUgcId =
    activePreviewUgcId && activeSelectedUgcIds.includes(activePreviewUgcId)
      ? activePreviewUgcId
      : (activeSelectedUgcIds[0] ?? null);
  const selectedUgcMetadata = useMemo(
    () =>
      activeSelectedUgcIds
        .map((id) => ugcClips.find((clip) => clip.id === id))
        .filter((clip): clip is VideoClipMetadata => Boolean(clip)),
    [activeSelectedUgcIds, ugcClips],
  );
  const activeUgcMetadata =
    selectedUgcMetadata.find((clip) => clip.id === activeUgcId) ??
    selectedUgcMetadata[0] ??
    null;
  const selectedDemoMetadata =
    demoClips.find((clip) => clip.id === activeDemoId) ?? null;
  const { clip: selectedUgcClip } = useLoadedVideoClip({
    clipId: activeUgcMetadata?.id ?? null,
    loadClip,
  });
  const { clip: selectedDemoClip } = useLoadedVideoClip({
    clipId: selectedDemoMetadata?.id ?? null,
    loadClip,
  });
  const selectedUgcTrimRangesByClipId = useMemo(
    () =>
      selectedUgcMetadata.reduce<Record<string, VideoTrimRange>>(
        (trimRanges, clip) => ({
          ...trimRanges,
          [clip.id]: clampVideoTrimRange(
            ugcTrimRangesByClipId[clip.id] ?? getDefaultVideoTrimRange(clip),
            clip.duration,
          ),
        }),
        {},
      ),
    [selectedUgcMetadata, ugcTrimRangesByClipId],
  );
  const selectedUgcTrimRange = activeUgcMetadata
    ? (selectedUgcTrimRangesByClipId[activeUgcMetadata.id] ??
      clampVideoTrimRange(
        ugcTrimRangesByClipId[activeUgcMetadata.id] ??
          getDefaultVideoTrimRange(activeUgcMetadata),
        activeUgcMetadata.duration,
      ))
    : null;
  const selectedDemoTrimRange = selectedDemoMetadata
    ? clampVideoTrimRange(
        demoTrimRangesByClipId[selectedDemoMetadata.id] ??
          getDefaultVideoTrimRange(selectedDemoMetadata),
        selectedDemoMetadata.duration,
      )
    : null;
  const selectedUgcDuration = selectedUgcTrimRange
    ? getVideoTrimRangeDuration(selectedUgcTrimRange)
    : 0;
  const selectedDemoDuration = selectedDemoTrimRange
    ? getVideoTrimRangeDuration(selectedDemoTrimRange)
    : 0;
  const canStitch = Boolean(
    selectedUgcMetadata.length &&
      selectedDemoClip &&
      selectedUgcTrimRange &&
      selectedDemoTrimRange,
  );
  const totalDuration = selectedUgcDuration + selectedDemoDuration;
  const clampedTextOverlay = textOverlay
    ? clampTextOverlay(textOverlay, totalDuration)
    : null;

  const handleSelectUgc = useCallback(
    (id: string) => {
      const clip = ugcClips.find((ugcClip) => ugcClip.id === id);
      const isCurrentlySelected = activeSelectedUgcIds.includes(id);

      setSelectedUgcIds((currentIds) => {
        const currentSelectedIds =
          currentIds === undefined
            ? ugcClips[0]
              ? [ugcClips[0].id]
              : []
            : currentIds;

        return toggleStitchrUgcSelection(currentSelectedIds, id);
      });

      if (!clip) {
        return;
      }

      if (
        !isCurrentlySelected &&
        activeSelectedUgcIds.length < maxStitchrUgcSelectionCount
      ) {
        setActivePreviewUgcId(id);
      } else if (isCurrentlySelected && activeUgcId === id) {
        setActivePreviewUgcId(undefined);
      }

      setUgcTrimRangesByClipId((trimRanges) =>
        trimRanges[id]
          ? trimRanges
          : {
              ...trimRanges,
              [id]: getDefaultVideoTrimRange(clip),
          },
      );
    },
    [activeSelectedUgcIds, activeUgcId, ugcClips],
  );

  const handleSelectDemo = useCallback(
    (id: string) => {
      const clip = demoClips.find((demoClip) => demoClip.id === id);

      setSelectedDemoId((currentId) => {
        const currentActiveId =
          currentId === undefined ? (demoClips[0]?.id ?? null) : currentId;

        return currentActiveId === id ? null : id;
      });

      if (!clip) {
        return;
      }

      setDemoTrimRangesByClipId((trimRanges) =>
        trimRanges[id]
          ? trimRanges
          : {
              ...trimRanges,
              [id]: getDefaultVideoTrimRange(clip),
            },
      );
    },
    [demoClips],
  );

  const handleUpdateUgcTrim = useCallback(
    (clip: VideoClipMetadata, trimRange: VideoTrimRange) => {
      setUgcTrimRangesByClipId((trimRanges) => ({
        ...trimRanges,
        [clip.id]: clampVideoTrimRange(trimRange, clip.duration),
      }));
    },
    [],
  );

  const handleUpdateDemoTrim = useCallback(
    (clip: VideoClipMetadata, trimRange: VideoTrimRange) => {
      setDemoTrimRangesByClipId((trimRanges) => ({
        ...trimRanges,
        [clip.id]: clampVideoTrimRange(trimRange, clip.duration),
      }));
    },
    [],
  );

  const handleStitch = () => {
    if (selectedDemoClip && selectedDemoTrimRange && selectedUgcMetadata.length) {
      const exportTextOverlay =
        textOverlay && textOverlay.text.trim().length > 0 ? textOverlay : null;
      const ugcSelections: StitchrUgcSelection[] = selectedUgcMetadata.map(
        (clip) => ({
          clip,
          trimRange:
            selectedUgcTrimRangesByClipId[clip.id] ??
            getDefaultVideoTrimRange(clip),
          loadClip: () => loadClip(clip.id),
        }),
      );

      void stitchrState.stitchVideos(
        ugcSelections,
        selectedDemoClip,
        selectedDemoTrimRange,
        exportTextOverlay,
      );
    }
  };

  const handleActiveUgcChange = useCallback((id: string) => {
    setActivePreviewUgcId(id);
  }, []);

  const isStitching =
    stitchrState.status === "reading" || stitchrState.status === "stitching";

  return (
    <StitchrShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <StitchrHeader />
        {library.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {library.error}
          </div>
        ) : null}
        {ugcClips.length && demoClips.length ? (
          <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
            <div className="flex flex-col gap-6">
              <ClipPickerPanel
                ugcClips={ugcClips}
                demoClips={demoClips}
                selectedUgcIds={activeSelectedUgcIds}
                selectedDemoId={selectedDemoMetadata?.id ?? null}
                selectedUgcTrimRangesByClipId={selectedUgcTrimRangesByClipId}
                selectedDemoTrimRange={selectedDemoTrimRange}
                onLoadClip={loadClip}
                onSelectUgc={handleSelectUgc}
                onSelectDemo={handleSelectDemo}
                onUpdateUgcTrim={handleUpdateUgcTrim}
                onUpdateDemoTrim={handleUpdateDemoTrim}
                canStitch={canStitch}
                isStitching={isStitching}
                onStitch={handleStitch}
              />
              <StitchrProgressPanel
                status={stitchrState.status}
                progress={stitchrState.progress}
                error={stitchrState.error}
                completedCount={stitchrState.completedCount}
                totalCount={stitchrState.totalCount}
              />
              <DownloadStitchesPanel stitches={stitchrState.stitches} />
            </div>
            <SequencePreviewPanel
              previewUgcClips={selectedUgcMetadata}
              activeUgcId={activeUgcMetadata?.id ?? null}
              ugcClip={selectedUgcClip}
              demoClip={selectedDemoClip}
              ugcTrimRange={selectedUgcTrimRange}
              demoTrimRange={selectedDemoTrimRange}
              textOverlay={clampedTextOverlay}
              onActiveUgcChange={handleActiveUgcChange}
              onTextOverlayChange={setTextOverlay}
            />
          </div>
        ) : (
          <StitchrEmptyState />
        )}
      </div>
    </StitchrShell>
  );
}
