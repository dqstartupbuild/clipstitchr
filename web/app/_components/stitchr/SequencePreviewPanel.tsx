"use client";

import { useCallback, useMemo, useState } from "react";
import { SequencePreviewNavigator } from "@/app/_components/stitchr/SequencePreviewNavigator";
import { SequenceVideoPlayer } from "@/app/_components/stitchr/SequenceVideoPlayer";
import { StitchrSequenceVideoPlayer } from "@/app/_components/stitchr/StitchrSequenceVideoPlayer";
import { TextOverlayEditor } from "@/app/_components/stitchr/TextOverlayEditor";
import { Panel } from "@/app/_components/ui/Panel";
import { useHorizontalSwipeNavigation } from "@/lib/clipstitchr/hooks/useHorizontalSwipeNavigation";
import type { StitchrMode } from "@/lib/clipstitchr/types/StitchrMode";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { getActiveTextOverlayId } from "@/lib/clipstitchr/utils/getActiveTextOverlayId";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";
import { replaceTextOverlayById } from "@/lib/clipstitchr/utils/replaceTextOverlayById";

type SequencePreviewPanelProps = {
  mode?: StitchrMode;
  previewUgcClips: VideoClipMetadata[];
  activeUgcId: string | null;
  ugcClip: VideoClip | null;
  demoClip: VideoClip | null;
  sequenceClips?: VideoClip[];
  sequenceCropBounds?: Array<VideoCropBounds | null | undefined>;
  sequenceIncludeAudioFlags?: boolean[];
  sequencePlaybackRates?: VideoPlaybackRate[];
  sequenceTrimRanges?: VideoTrimRange[];
  ugcCropBounds?: VideoCropBounds | null;
  demoCropBounds?: VideoCropBounds | null;
  ugcTrimRange: VideoTrimRange | null;
  demoTrimRange: VideoTrimRange | null;
  demoPlaybackRate: VideoPlaybackRate;
  includeDemoAudio: boolean;
  includeUgcAudio: boolean;
  textOverlays: TextOverlay[];
  ugcPlaybackRate: VideoPlaybackRate;
  canCopyTextOverlayToAll?: boolean;
  onActiveUgcChange: (id: string) => void;
  onCopyTextOverlayToAll?: () => void;
  onTextOverlaysChange: (textOverlays: TextOverlay[]) => void;
};

export function SequencePreviewPanel({
  mode = "normal",
  previewUgcClips,
  activeUgcId,
  ugcClip,
  demoClip,
  sequenceClips = [],
  sequenceCropBounds = [],
  sequenceIncludeAudioFlags = [],
  sequencePlaybackRates = [],
  sequenceTrimRanges = [],
  ugcCropBounds = null,
  demoCropBounds = null,
  ugcTrimRange,
  demoTrimRange,
  demoPlaybackRate,
  includeDemoAudio,
  includeUgcAudio,
  textOverlays,
  ugcPlaybackRate,
  canCopyTextOverlayToAll = false,
  onActiveUgcChange,
  onCopyTextOverlayToAll,
  onTextOverlaysChange,
}: SequencePreviewPanelProps) {
  const [playbackTime, setPlaybackTime] = useState(0);
  const [activeTextOverlayId, setActiveTextOverlayId] = useState<string | null>(
    null,
  );
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
    () =>
      mode === "longr"
        ? sequenceTrimRanges.reduce(
            (duration, trimRange, index) =>
              duration +
              getPlaybackRateDuration(
                trimRange,
                sequencePlaybackRates[index] ?? 1,
              ),
            0,
          )
        : ugcDuration + demoDuration,
    [
      demoDuration,
      mode,
      sequencePlaybackRates,
      sequenceTrimRanges,
      ugcDuration,
    ],
  );
  const selectedTextOverlayId = getActiveTextOverlayId(
    textOverlays,
    activeTextOverlayId,
  );
  const handleOverlayChange = useCallback(
    (nextTextOverlay: TextOverlay) => {
      if (!selectedTextOverlayId) {
        onTextOverlaysChange([nextTextOverlay]);
        return;
      }

      onTextOverlaysChange(
        replaceTextOverlayById(
          textOverlays,
          selectedTextOverlayId,
          nextTextOverlay,
        ),
      );
    },
    [onTextOverlaysChange, selectedTextOverlayId, textOverlays],
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
      {mode === "longr" && sequenceClips.length && sequenceTrimRanges.length ? (
        <>
          <StitchrSequenceVideoPlayer
            key={sequenceClips
              .map((clip, index) => {
                const trimRange = sequenceTrimRanges[index];
                const cropBounds = sequenceCropBounds[index];

                return `${clip.id}:${trimRange?.start}:${trimRange?.end}:${cropBounds?.top ?? 0}:${cropBounds?.bottom ?? 0}:${cropBounds?.left ?? 0}:${cropBounds?.right ?? 0}:${sequencePlaybackRates[index] ?? 1}`;
              })
              .join("|")}
            clips={sequenceClips}
            cropBounds={sequenceCropBounds}
            includeAudioFlags={sequenceIncludeAudioFlags}
            playbackRates={sequencePlaybackRates}
            textOverlays={textOverlays}
            activeTextOverlayId={selectedTextOverlayId}
            totalDuration={totalDuration}
            trimRanges={sequenceTrimRanges}
            onActiveTextOverlayIdChange={setActiveTextOverlayId}
            onTextOverlayChange={handleOverlayChange}
            onPlaybackTimeChange={setPlaybackTime}
          />
          <TextOverlayEditor
            textOverlays={textOverlays}
            totalDuration={totalDuration}
            ugcDuration={0}
            currentTime={playbackTime}
            activeTextOverlayId={selectedTextOverlayId}
            onActiveTextOverlayIdChange={setActiveTextOverlayId}
            onChange={onTextOverlaysChange}
          />
        </>
      ) : ugcClip && demoClip && ugcTrimRange && demoTrimRange ? (
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
              key={`${ugcClip.id}:${ugcTrimRange.start}:${ugcTrimRange.end}:${ugcCropBounds?.top ?? 0}:${ugcCropBounds?.bottom ?? 0}:${ugcCropBounds?.left ?? 0}:${ugcCropBounds?.right ?? 0}:${ugcPlaybackRate}:${demoClip.id}:${demoTrimRange.start}:${demoTrimRange.end}:${demoCropBounds?.top ?? 0}:${demoCropBounds?.bottom ?? 0}:${demoCropBounds?.left ?? 0}:${demoCropBounds?.right ?? 0}:${demoPlaybackRate}`}
              ugcClip={ugcClip}
              demoClip={demoClip}
              demoPlaybackRate={demoPlaybackRate}
              ugcCropBounds={ugcCropBounds}
              demoCropBounds={demoCropBounds}
              ugcTrimRange={ugcTrimRange}
              demoTrimRange={demoTrimRange}
              includeDemoAudio={includeDemoAudio}
              includeUgcAudio={includeUgcAudio}
              textOverlays={textOverlays}
              activeTextOverlayId={selectedTextOverlayId}
              totalDuration={totalDuration}
              ugcPlaybackRate={ugcPlaybackRate}
              onActiveTextOverlayIdChange={setActiveTextOverlayId}
              onTextOverlayChange={handleOverlayChange}
              onPlaybackTimeChange={setPlaybackTime}
            />
          </div>
          <TextOverlayEditor
            textOverlays={textOverlays}
            totalDuration={totalDuration}
            ugcDuration={ugcDuration}
            currentTime={playbackTime}
            activeTextOverlayId={selectedTextOverlayId}
            canCopyToAll={canCopyTextOverlayToAll}
            onActiveTextOverlayIdChange={setActiveTextOverlayId}
            onChange={onTextOverlaysChange}
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
