"use client";

import { useMemo, useState } from "react";
import { StitchrSequenceVideoPlayer } from "@/app/_components/stitchr/StitchrSequenceVideoPlayer";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { clampTextOverlays } from "@/lib/clipstitchr/utils/clampTextOverlays";
import { getActiveTextOverlayId } from "@/lib/clipstitchr/utils/getActiveTextOverlayId";
import { getNonEmptyTextOverlays } from "@/lib/clipstitchr/utils/getNonEmptyTextOverlays";
import { getOrderedStitchSequenceSegments } from "@/lib/clipstitchr/utils/getOrderedStitchSequenceSegments";
import { getTextOverlayList } from "@/lib/clipstitchr/utils/getTextOverlayList";
import { replaceTextOverlayById } from "@/lib/clipstitchr/utils/replaceTextOverlayById";

type LoadedStitchSequenceSegmentsPreviewProps = {
  clips: VideoClip[];
  stitch: Stitch;
  onTextOverlayChange?: (textOverlays: TextOverlay[]) => void;
};

export function LoadedStitchSequenceSegmentsPreview({
  clips,
  stitch,
  onTextOverlayChange,
}: LoadedStitchSequenceSegmentsPreviewProps) {
  const [activeTextOverlayId, setActiveTextOverlayId] = useState<string | null>(
    null,
  );
  const segments = useMemo(
    () => getOrderedStitchSequenceSegments(stitch.sequenceSegments),
    [stitch.sequenceSegments],
  );
  const totalDuration = segments.reduce(
    (duration, segment) => duration + segment.duration,
    0,
  );
  const textOverlays = useMemo(() => {
    const clampedTextOverlays = clampTextOverlays(
      getTextOverlayList(stitch.textOverlays, stitch.textOverlay),
      totalDuration,
    );

    return onTextOverlayChange
      ? clampedTextOverlays
      : getNonEmptyTextOverlays(clampedTextOverlays);
  }, [onTextOverlayChange, stitch.textOverlay, stitch.textOverlays, totalDuration]);
  const selectedTextOverlayId = onTextOverlayChange
    ? getActiveTextOverlayId(textOverlays, activeTextOverlayId)
    : null;

  return (
    <StitchrSequenceVideoPlayer
      activeTextOverlayId={selectedTextOverlayId}
      clips={clips}
      includeAudioFlags={segments.map((segment) =>
        segment.clipType === "demo"
          ? stitch.includeDemoAudio === true
          : stitch.includeUgcAudio === true,
      )}
      playbackRates={segments.map((segment) => segment.playbackRate ?? 1)}
      quickEdits={segments.map((segment) => segment.quickEdit)}
      textOverlays={textOverlays}
      totalDuration={totalDuration}
      trimRanges={segments.map((segment) => segment.trimRange)}
      onActiveTextOverlayIdChange={setActiveTextOverlayId}
      onPlaybackTimeChange={() => undefined}
      onTextOverlayChange={(nextTextOverlay) => {
        if (!onTextOverlayChange) {
          return;
        }

        onTextOverlayChange(
          selectedTextOverlayId
            ? replaceTextOverlayById(
                textOverlays,
                selectedTextOverlayId,
                nextTextOverlay,
              )
            : [nextTextOverlay],
        );
      }}
    />
  );
}
