"use client";

import { useCallback, useMemo, useState } from "react";
import { ClipPickerPanel } from "@/app/_components/stitchr/ClipPickerPanel";
import { StitchrProgressPanel } from "@/app/_components/stitchr/StitchrProgressPanel";
import { StitchrEmptyState } from "@/app/_components/stitchr/StitchrEmptyState";
import { StitchrHeader } from "@/app/_components/stitchr/StitchrHeader";
import { StitchrShell } from "@/app/_components/stitchr/StitchrShell";
import { DownloadStitchPanel } from "@/app/_components/stitchr/DownloadStitchPanel";
import { SequencePreviewPanel } from "@/app/_components/stitchr/SequencePreviewPanel";
import { VideoTrimDialog } from "@/app/_components/trim/VideoTrimDialog";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { useStitchr } from "@/lib/clipstitchr/hooks/useStitchr";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { filterClipsByType } from "@/lib/clipstitchr/utils/filterClipsByType";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type TrimEditorState = {
  clipType: "ugc" | "demo";
  clip: VideoClip;
  trimRange: VideoTrimRange;
};

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
  const [trimEditor, setTrimEditor] = useState<TrimEditorState | null>(null);
  const ugcClips = useMemo(
    () => filterClipsByType(library.clips, "ugc"),
    [library.clips],
  );
  const demoClips = useMemo(
    () => filterClipsByType(library.clips, "demo"),
    [library.clips],
  );
  const [selectedUgcId, setSelectedUgcId] = useState<string | null>(null);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);
  const selectedUgcClip =
    ugcClips.find((clip) => clip.id === selectedUgcId) ?? ugcClips[0] ?? null;
  const selectedDemoClip =
    demoClips.find((clip) => clip.id === selectedDemoId) ?? demoClips[0] ?? null;
  const selectedUgcTrimRange = selectedUgcClip
    ? clampVideoTrimRange(
        ugcTrimRangesByClipId[selectedUgcClip.id] ??
          getDefaultVideoTrimRange(selectedUgcClip),
        selectedUgcClip.duration,
      )
    : null;
  const selectedDemoTrimRange = selectedDemoClip
    ? clampVideoTrimRange(
        demoTrimRangesByClipId[selectedDemoClip.id] ??
          getDefaultVideoTrimRange(selectedDemoClip),
        selectedDemoClip.duration,
      )
    : null;
  const selectedUgcDuration = selectedUgcTrimRange
    ? getVideoTrimRangeDuration(selectedUgcTrimRange)
    : 0;
  const selectedDemoDuration = selectedDemoTrimRange
    ? getVideoTrimRangeDuration(selectedDemoTrimRange)
    : 0;
  const canStitch = Boolean(
    selectedUgcClip &&
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

      setSelectedUgcId(id);

      if (!clip) {
        return;
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
    [ugcClips],
  );

  const handleSelectDemo = useCallback(
    (id: string) => {
      const clip = demoClips.find((demoClip) => demoClip.id === id);

      setSelectedDemoId(id);

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

  const handleEditUgcTrim = useCallback(
    (clip: VideoClip) => {
      setTrimEditor({
        clipType: "ugc",
        clip,
        trimRange:
          ugcTrimRangesByClipId[clip.id] ?? getDefaultVideoTrimRange(clip),
      });
    },
    [ugcTrimRangesByClipId],
  );

  const handleEditDemoTrim = useCallback(
    (clip: VideoClip) => {
      setTrimEditor({
        clipType: "demo",
        clip,
        trimRange:
          demoTrimRangesByClipId[clip.id] ?? getDefaultVideoTrimRange(clip),
      });
    },
    [demoTrimRangesByClipId],
  );

  const handleSaveTrim = async (trimRange: VideoTrimRange) => {
    if (!trimEditor) {
      return;
    }

    const clampedTrimRange = clampVideoTrimRange(
      trimRange,
      trimEditor.clip.duration,
    );

    if (trimEditor.clipType === "ugc") {
      setUgcTrimRangesByClipId((trimRanges) => ({
        ...trimRanges,
        [trimEditor.clip.id]: clampedTrimRange,
      }));
    } else {
      setDemoTrimRangesByClipId((trimRanges) => ({
        ...trimRanges,
        [trimEditor.clip.id]: clampedTrimRange,
      }));
    }

    setTrimEditor(null);
  };

  const handleStitch = () => {
    if (
      selectedUgcClip &&
      selectedDemoClip &&
      selectedUgcTrimRange &&
      selectedDemoTrimRange
    ) {
      const exportTextOverlay =
        clampedTextOverlay && clampedTextOverlay.text.trim().length > 0
          ? clampedTextOverlay
          : null;

      void stitchrState.stitchVideo(
        selectedUgcClip,
        selectedDemoClip,
        selectedUgcTrimRange,
        selectedDemoTrimRange,
        exportTextOverlay,
      );
    }
  };

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
                selectedUgcId={selectedUgcClip?.id ?? null}
                selectedDemoId={selectedDemoClip?.id ?? null}
                selectedUgcTrimRange={selectedUgcTrimRange}
                selectedDemoTrimRange={selectedDemoTrimRange}
                onSelectUgc={handleSelectUgc}
                onSelectDemo={handleSelectDemo}
                onEditUgcTrim={handleEditUgcTrim}
                onEditDemoTrim={handleEditDemoTrim}
                canStitch={canStitch}
                isStitching={stitchrState.status === "stitching"}
                onStitch={handleStitch}
              />
              <StitchrProgressPanel
                status={stitchrState.status}
                progress={stitchrState.progress}
                error={stitchrState.error}
              />
              <DownloadStitchPanel
                stitch={stitchrState.stitch}
              />
            </div>
            <SequencePreviewPanel
              ugcClip={selectedUgcClip}
              demoClip={selectedDemoClip}
              ugcTrimRange={selectedUgcTrimRange}
              demoTrimRange={selectedDemoTrimRange}
              textOverlay={clampedTextOverlay}
              onTextOverlayChange={setTextOverlay}
            />
          </div>
        ) : (
          <StitchrEmptyState />
        )}
      </div>
      {trimEditor ? (
        <VideoTrimDialog
          clip={trimEditor.clip}
          initialTrimRange={trimEditor.trimRange}
          title="Stitch trim"
          onClose={() => setTrimEditor(null)}
          onSave={handleSaveTrim}
        />
      ) : null}
    </StitchrShell>
  );
}
