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
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { createQuickEditSuggestionsFromMetadata } from "@/lib/clipstitchr/utils/createQuickEditSuggestionsFromMetadata";
import { getActiveTextOverlayId } from "@/lib/clipstitchr/utils/getActiveTextOverlayId";
import { getQuickEditPlaybackDuration } from "@/lib/clipstitchr/utils/getQuickEditPlaybackDuration";
import { replaceTextOverlayById } from "@/lib/clipstitchr/utils/replaceTextOverlayById";

type SequencePreviewPanelProps = {
  mode?: StitchrMode;
  previewUgcClips: VideoClipMetadata[];
  activeUgcId: string | null;
  ugcClip: VideoClip | null;
  demoClip: VideoClip | null;
  sequenceClips?: VideoClip[];
  sequenceIncludeAudioFlags?: boolean[];
  sequencePlaybackRates?: VideoPlaybackRate[];
  sequenceTrimRanges?: VideoTrimRange[];
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
  sequenceIncludeAudioFlags = [],
  sequencePlaybackRates = [],
  sequenceTrimRanges = [],
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
  const ugcQuickEdit = createQuickEditSuggestionsFromMetadata(
    ugcClip?.quickEdit,
  );
  const demoQuickEdit = createQuickEditSuggestionsFromMetadata(
    demoClip?.quickEdit,
  );
  const ugcDuration = ugcTrimRange
    ? getQuickEditPlaybackDuration(
        ugcTrimRange,
        ugcClip?.duration ?? ugcTrimRange.end,
        ugcQuickEdit?.removeRanges,
        ugcPlaybackRate,
      )
    : 0;
  const demoDuration = demoTrimRange
    ? getQuickEditPlaybackDuration(
        demoTrimRange,
        demoClip?.duration ?? demoTrimRange.end,
        demoQuickEdit?.removeRanges,
        demoPlaybackRate,
      )
    : 0;
  const totalDuration = useMemo(
    () =>
      mode === "longr"
        ? sequenceTrimRanges.reduce(
            (duration, trimRange, index) =>
              duration +
              getQuickEditPlaybackDuration(
                trimRange,
                sequenceClips[index]?.duration ?? trimRange.end,
                sequenceClips[index]?.quickEdit?.removeRanges,
                sequencePlaybackRates[index] ?? 1,
              ),
            0,
          )
        : ugcDuration + demoDuration,
    [
      demoDuration,
      mode,
      sequenceClips,
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

                return `${clip.id}:${trimRange?.start}:${trimRange?.end}:${sequencePlaybackRates[index] ?? 1}`;
              })
              .join("|")}
            clips={sequenceClips}
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
              key={`${ugcClip.id}:${ugcTrimRange.start}:${ugcTrimRange.end}:${ugcPlaybackRate}:${demoClip.id}:${demoTrimRange.start}:${demoTrimRange.end}:${demoPlaybackRate}`}
              ugcClip={ugcClip}
              demoClip={demoClip}
              demoPlaybackRate={demoPlaybackRate}
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
