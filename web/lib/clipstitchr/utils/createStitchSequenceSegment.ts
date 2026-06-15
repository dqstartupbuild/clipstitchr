import type { StitchSequenceSegment } from "@/lib/clipstitchr/types/StitchSequenceSegment";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { createQuickEditSuggestionsFromMetadata } from "@/lib/clipstitchr/utils/createQuickEditSuggestionsFromMetadata";
import { getQuickEditPlaybackDuration } from "@/lib/clipstitchr/utils/getQuickEditPlaybackDuration";

type CreateStitchSequenceSegmentOptions = {
  clip: VideoClipMetadata;
  order: number;
  playbackRate?: VideoPlaybackRate;
  trimRange: VideoTrimRange;
};

export function createStitchSequenceSegment({
  clip,
  order,
  playbackRate = 1,
  trimRange,
}: CreateStitchSequenceSegmentOptions): StitchSequenceSegment {
  const clampedTrimRange = clampVideoTrimRange(trimRange, clip.duration);
  const quickEdit = createQuickEditSuggestionsFromMetadata(clip.quickEdit);

  return {
    clipId: clip.id,
    clipName: clip.name,
    clipType: clip.clipType,
    duration: getQuickEditPlaybackDuration(
      clampedTrimRange,
      clip.duration,
      quickEdit?.removeRanges,
      playbackRate,
    ),
    order,
    playbackRate,
    ...(quickEdit ? { quickEdit } : {}),
    trimRange: clampedTrimRange,
  };
}
