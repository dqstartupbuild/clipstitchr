import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clamp } from "@/lib/clipstitchr/utils/clamp";
import { getQuickEditPlayableRanges } from "@/lib/clipstitchr/utils/getQuickEditPlayableRanges";

export function getQuickEditPlaybackTimeForSourceTime(
  sourceTime: number,
  trimRange: VideoTrimRange,
  duration: number,
  removeRanges: QuickEditRemoveRange[] = [],
  playbackRate: VideoPlaybackRate = 1,
) {
  const playableRanges = getQuickEditPlayableRanges(
    trimRange,
    duration,
    removeRanges,
  );
  let elapsedTime = 0;

  for (const range of playableRanges) {
    if (sourceTime <= range.start) {
      return elapsedTime;
    }

    if (sourceTime <= range.end) {
      return elapsedTime + (sourceTime - range.start) / playbackRate;
    }

    elapsedTime += (range.end - range.start) / playbackRate;
  }

  return clamp(elapsedTime, 0, elapsedTime);
}
