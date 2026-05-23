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
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";

type SequencePreviewPanelProps = {
  previewUgcClips: VideoClipMetadata[];
  activeUgcId: string | null;
  ugcClip: VideoClip | null;
  demoClip: VideoClip | null;
  ugcTrimRange: VideoTrimRange | null;
  demoTrimRange: VideoTrimRange | null;
  demoPlaybackRate: VideoPlaybackRate;
  includeDemoAudio: boolean;
  includeUgcAudio: boolean;
  textOverlay: TextOverlay | null;
  ugcPlaybackRate: VideoPlaybackRate;
  canCopyTextOverlayToAll?: boolean;
  onActiveUgcChange: (id: string) => void;
  onCopyTextOverlayToAll?: () => void;
  onTextOverlayChange: (textOverlay: TextOverlay | null) => void;
};

export function SequencePreviewPanel({
  previewUgcClips,
  activeUgcId,
  ugcClip,
  demoClip,
  ugcTrimRange,
  demoTrimRange,
  demoPlaybackRate,
  includeDemoAudio,
  includeUgcAudio,
  textOverlay,
  ugcPlaybackRate,
  canCopyTextOverlayToAll = false,
  onActiveUgcChange,
  onCopyTextOverlayToAll,
  onTextOverlayChange,
}: SequencePreviewPanelProps) {
  const [playbackTime, setPlaybackTime] = useState(0);
  const activePreviewIndex = Math.max(
    0,
    previewUgcClips.findIndex((clip) => clip.id === activeUgcId),
  );
  const activePreviewClip = previewUgcClips[activePreviewIndex] ?? null;
  const ugcDuration = ugcTrimRange
    ? getPlaybackRateDuration(ugcTrimRange, ugcPlaybackRate)
    : 0;
  const demoDuration = demoTrimRange
    ? getPlaybackRateDuration(demoTrimRange, demoPlaybackRate)
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
    <Panel className="mx-auto w-full max-w-[340px] p-3 xl:mx-0">
      <div className="mb-3">
        <p className="text-sm font-semibold text-accent-dark">Preview</p>
        <h2 className="mt-0.5 text-base font-bold text-text-primary">
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
              key={`${ugcClip.id}:${ugcTrimRange.start}:${ugcTrimRange.end}:${ugcPlaybackRate}:${demoClip.id}:${demoTrimRange.start}:${demoTrimRange.end}:${demoPlaybackRate}`}
              ugcClip={ugcClip}
              demoClip={demoClip}
              demoPlaybackRate={demoPlaybackRate}
              ugcTrimRange={ugcTrimRange}
              demoTrimRange={demoTrimRange}
              includeDemoAudio={includeDemoAudio}
              includeUgcAudio={includeUgcAudio}
              textOverlay={textOverlay}
              totalDuration={totalDuration}
              ugcPlaybackRate={ugcPlaybackRate}
              onTextOverlayChange={handleOverlayChange}
              onPlaybackTimeChange={setPlaybackTime}
            />
          </div>
          <TextOverlayEditor
            textOverlay={textOverlay}
            totalDuration={totalDuration}
            ugcDuration={ugcDuration}
            currentTime={playbackTime}
            canCopyToAll={canCopyTextOverlayToAll}
            onChange={onTextOverlayChange}
            onCopyToAll={onCopyTextOverlayToAll}
          />
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-slate-50 p-8 text-center text-sm text-text-secondary">
          Select UGC and a product demo to preview the ads.
        </div>
      )}
    </Panel>
  );
}
