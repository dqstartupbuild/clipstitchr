"use client";

import { useCallback, useMemo, useState } from "react";
import { ClipPickerPanel } from "@/app/_components/create/ClipPickerPanel";
import { CreateProgressPanel } from "@/app/_components/create/CreateProgressPanel";
import { CreateVideoEmptyState } from "@/app/_components/create/CreateVideoEmptyState";
import { CreateVideoHeader } from "@/app/_components/create/CreateVideoHeader";
import { CreateVideoShell } from "@/app/_components/create/CreateVideoShell";
import { DownloadCreatedVideoPanel } from "@/app/_components/create/DownloadCreatedVideoPanel";
import { SequencePreviewPanel } from "@/app/_components/create/SequencePreviewPanel";
import { VideoTrimDialog } from "@/app/_components/trim/VideoTrimDialog";
import { useClipLibrary } from "@/lib/clipr/hooks/useClipLibrary";
import { useCreateVideo } from "@/lib/clipr/hooks/useCreateVideo";
import type { TextOverlay } from "@/lib/clipr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";
import type { VideoTrimRange } from "@/lib/clipr/types/VideoTrimRange";
import { clampTextOverlay } from "@/lib/clipr/utils/clampTextOverlay";
import { clampVideoTrimRange } from "@/lib/clipr/utils/clampVideoTrimRange";
import { filterClipsByType } from "@/lib/clipr/utils/filterClipsByType";
import { getDefaultVideoTrimRange } from "@/lib/clipr/utils/getDefaultVideoTrimRange";
import { getVideoTrimRangeDuration } from "@/lib/clipr/utils/getVideoTrimRangeDuration";

type TrimEditorState = {
  clipType: "ugc" | "demo";
  clip: VideoClip;
  trimRange: VideoTrimRange;
};

export function CreateVideoPageClient() {
  const library = useClipLibrary();
  const createVideoState = useCreateVideo({ onCreated: library.refresh });
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
  const canCreate = Boolean(
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

  const handleCreateVideo = () => {
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

      void createVideoState.createVideo(
        selectedUgcClip,
        selectedDemoClip,
        selectedUgcTrimRange,
        selectedDemoTrimRange,
        exportTextOverlay,
      );
    }
  };

  return (
    <CreateVideoShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <CreateVideoHeader />
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
                canCreate={canCreate}
                isCreating={createVideoState.status === "stitching"}
                onCreate={handleCreateVideo}
              />
              <CreateProgressPanel
                status={createVideoState.status}
                progress={createVideoState.progress}
                error={createVideoState.error}
              />
              <DownloadCreatedVideoPanel
                createdVideo={createVideoState.createdVideo}
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
          <CreateVideoEmptyState />
        )}
      </div>
      {trimEditor ? (
        <VideoTrimDialog
          clip={trimEditor.clip}
          initialTrimRange={trimEditor.trimRange}
          title="Creation trim"
          onClose={() => setTrimEditor(null)}
          onSave={handleSaveTrim}
        />
      ) : null}
    </CreateVideoShell>
  );
}
