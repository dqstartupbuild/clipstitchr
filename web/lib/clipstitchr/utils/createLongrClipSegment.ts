import type { LongrClipSegment } from "@/lib/clipstitchr/types/LongrClipSegment";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";

type CreateLongrClipSegmentOptions = {
  clip: VideoClipMetadata;
  order: number;
  playbackRate?: VideoPlaybackRate;
  trimRange: VideoTrimRange;
};

export function createLongrClipSegment({
  clip,
  order,
  playbackRate = 1,
  trimRange,
}: CreateLongrClipSegmentOptions): LongrClipSegment {
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
