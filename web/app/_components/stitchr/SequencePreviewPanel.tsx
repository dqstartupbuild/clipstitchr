"use client";

import { useCallback, useMemo, useState } from "react";
import { SequencePreviewNavigator } from "@/app/_components/stitchr/SequencePreviewNavigator";
import { SequenceVideoPlayer } from "@/app/_components/stitchr/SequenceVideoPlayer";
import { TextOverlayEditor } from "@/app/_components/stitchr/TextOverlayEditor";
import { Panel } from "@/app/_components/ui/Panel";
import { useHorizontalSwipeNavigation } from "@/lib/clipstitchr/hooks/useHorizontalSwipeNavigation";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type SequencePreviewPanelProps = {
  previewUgcClips: VideoClipMetadata[];
  activeUgcId: string | null;
  ugcClip: VideoClip | null;
  demoClip: VideoClip | null;
  ugcTrimRange: VideoTrimRange | null;
  demoTrimRange: VideoTrimRange | null;
  textOverlay: TextOverlay | null;
  onActiveUgcChange: (id: string) => void;
  onTextOverlayChange: (textOverlay: TextOverlay | null) => void;
};

export function SequencePreviewPanel({
  previewUgcClips,
  activeUgcId,
  ugcClip,
  demoClip,
  ugcTrimRange,
  demoTrimRange,
  textOverlay,
  onActiveUgcChange,
  onTextOverlayChange,
}: SequencePreviewPanelProps) {
  const [playbackTime, setPlaybackTime] = useState(0);
  const activePreviewIndex = Math.max(
    0,
    previewUgcClips.findIndex((clip) => clip.id === activeUgcId),
  );
  const activePreviewClip = previewUgcClips[activePreviewIndex] ?? null;
  const ugcDuration = ugcTrimRange
    ? getVideoTrimRangeDuration(ugcTrimRange)
    : 0;
  const demoDuration = demoTrimRange
    ? getVideoTrimRangeDuration(demoTrimRange)
    : 0;
  const totalDuration = useMemo(
    () => ugcDuration + demoDuration,
    [demoDuration, ugcDuration],
  );
  const handleOverlayChange = useCallback(
    (nextTextOverlay: TextOverlay) => {
      onTextOverlayChange(nextTextOverlay);
    },
    [onTextOverlayChange],
  );
  const handleSelectPreviewIndex = useCallback(
    (index: number) => {
      const clip = previewUgcClips[index];

      if (clip) {
        onActiveUgcChange(clip.id);
      }
    },
    [onActiveUgcChange, previewUgcClips],
  );
  const handlePreviousPreview = useCallback(() => {
    if (previewUgcClips.length <= 1) {
      return;
    }

    handleSelectPreviewIndex(
      (activePreviewIndex - 1 + previewUgcClips.length) %
        previewUgcClips.length,
    );
  }, [activePreviewIndex, handleSelectPreviewIndex, previewUgcClips.length]);
  const handleNextPreview = useCallback(() => {
    if (previewUgcClips.length <= 1) {
      return;
    }

    handleSelectPreviewIndex((activePreviewIndex + 1) % previewUgcClips.length);
  }, [activePreviewIndex, handleSelectPreviewIndex, previewUgcClips.length]);
  const swipeHandlers = useHorizontalSwipeNavigation({
    isEnabled: previewUgcClips.length > 1,
    onSwipeLeft: handleNextPreview,
    onSwipeRight: handlePreviousPreview,
  });

  return (
    <Panel className="p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-accent-dark">Preview</p>
        <h2 className="mt-2 text-xl font-bold text-text-primary">
          Ad sequence
        </h2>
      </div>
      {ugcClip && demoClip && ugcTrimRange && demoTrimRange ? (
        <>
          <SequencePreviewNavigator
            activeIndex={activePreviewIndex}
            activeName={activePreviewClip?.name ?? ugcClip.name}
            totalCount={previewUgcClips.length}
            onPrevious={handlePreviousPreview}
            onNext={handleNextPreview}
            onSelectIndex={handleSelectPreviewIndex}
          />
          <div {...swipeHandlers}>
            <SequenceVideoPlayer
              key={`${ugcClip.id}:${ugcTrimRange.start}:${ugcTrimRange.end}:${demoClip.id}:${demoTrimRange.start}:${demoTrimRange.end}`}
              ugcClip={ugcClip}
              demoClip={demoClip}
              ugcTrimRange={ugcTrimRange}
              demoTrimRange={demoTrimRange}
              textOverlay={textOverlay}
              totalDuration={totalDuration}
              onTextOverlayChange={handleOverlayChange}
              onPlaybackTimeChange={setPlaybackTime}
            />
          </div>
          <TextOverlayEditor
            textOverlay={textOverlay}
            totalDuration={totalDuration}
            ugcDuration={ugcDuration}
            currentTime={playbackTime}
            onChange={onTextOverlayChange}
          />
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-slate-50 p-8 text-center text-sm text-text-secondary">
          Select UGC clips and a product demo to preview the ads.
        </div>
      )}
    </Panel>
  );
}
