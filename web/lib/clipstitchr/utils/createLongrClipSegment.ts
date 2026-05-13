import type { LongrClipSegment } from "@/lib/clipstitchr/types/LongrClipSegment";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type CreateLongrClipSegmentOptions = {
  clip: VideoClipMetadata;
  order: number;
  trimRange: VideoTrimRange;
};

export function createLongrClipSegment({
  clip,
  order,
  trimRange,
}: CreateLongrClipSegmentOptions): LongrClipSegment {
  const clampedTrimRange = clampVideoTrimRange(trimRange, clip.duration);

  return {
    clipId: clip.id,
    clipName: clip.name,
    clipType: clip.clipType,
    duration: getVideoTrimRangeDuration(clampedTrimRange),
    order,
    trimRange: clampedTrimRange,
  };
}
