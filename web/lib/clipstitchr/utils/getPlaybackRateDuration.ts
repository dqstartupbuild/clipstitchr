import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

export function getPlaybackRateDuration(
  trimRange: VideoTrimRange,
  playbackRate: VideoPlaybackRate = 1,
) {
  return getVideoTrimRangeDuration(trimRange) / playbackRate;
}
