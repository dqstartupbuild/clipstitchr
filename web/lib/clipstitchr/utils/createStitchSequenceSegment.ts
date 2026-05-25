import type { StitchSequenceSegment } from "@/lib/clipstitchr/types/StitchSequenceSegment";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";

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

  return {
    clipId: clip.id,
    clipName: clip.name,
    clipType: clip.clipType,
    duration: getPlaybackRateDuration(clampedTrimRange, playbackRate),
    order,
    playbackRate,
    trimRange: clampedTrimRange,
  };
}
