"use client";

import { useMemo, useState } from "react";
import { ClipPickerPanel } from "@/app/_components/create/ClipPickerPanel";
import { CreateProgressPanel } from "@/app/_components/create/CreateProgressPanel";
import { CreateVideoEmptyState } from "@/app/_components/create/CreateVideoEmptyState";
import { CreateVideoHeader } from "@/app/_components/create/CreateVideoHeader";
import { CreateVideoShell } from "@/app/_components/create/CreateVideoShell";
import { DownloadCreatedVideoPanel } from "@/app/_components/create/DownloadCreatedVideoPanel";
import { SequencePreviewPanel } from "@/app/_components/create/SequencePreviewPanel";
import { useClipLibrary } from "@/lib/clipr/hooks/useClipLibrary";
import { useCreateVideo } from "@/lib/clipr/hooks/useCreateVideo";
import type { TextOverlay } from "@/lib/clipr/types/TextOverlay";
import { clampTextOverlay } from "@/lib/clipr/utils/clampTextOverlay";
import { filterClipsByType } from "@/lib/clipr/utils/filterClipsByType";

export function CreateVideoPageClient() {
  const library = useClipLibrary();
  const createVideoState = useCreateVideo({ onCreated: library.refresh });
  const [textOverlay, setTextOverlay] = useState<TextOverlay | null>(null);
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
  const canCreate = Boolean(selectedUgcClip && selectedDemoClip);
  const totalDuration =
    (selectedUgcClip?.duration ?? 0) + (selectedDemoClip?.duration ?? 0);
  const clampedTextOverlay = textOverlay
    ? clampTextOverlay(textOverlay, totalDuration)
    : null;

  const handleCreateVideo = () => {
    if (selectedUgcClip && selectedDemoClip) {
      const exportTextOverlay =
        clampedTextOverlay && clampedTextOverlay.text.trim().length > 0
          ? clampedTextOverlay
          : null;

      void createVideoState.createVideo(
        selectedUgcClip,
        selectedDemoClip,
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
                onSelectUgc={setSelectedUgcId}
                onSelectDemo={setSelectedDemoId}
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
              textOverlay={clampedTextOverlay}
              onTextOverlayChange={setTextOverlay}
            />
          </div>
        ) : (
          <CreateVideoEmptyState />
        )}
      </div>
    </CreateVideoShell>
  );
}
