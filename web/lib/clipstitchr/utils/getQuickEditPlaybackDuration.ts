import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { getQuickEditPlayableRanges } from "@/lib/clipstitchr/utils/getQuickEditPlayableRanges";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";

export function getQuickEditPlaybackDuration(
  trimRange: VideoTrimRange,
  duration: number,
  removeRanges: QuickEditRemoveRange[] = [],
  playbackRate: VideoPlaybackRate = 1,
) {
  return getQuickEditPlayableRanges(trimRange, duration, removeRanges).reduce(
    (total, playableRange) =>
      total + getPlaybackRateDuration(playableRange, playbackRate),
    0,
  );
}
