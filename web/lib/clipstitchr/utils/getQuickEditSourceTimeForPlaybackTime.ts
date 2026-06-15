import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { getQuickEditPlayableRanges } from "@/lib/clipstitchr/utils/getQuickEditPlayableRanges";

export function getQuickEditSourceTimeForPlaybackTime(
  playbackTime: number,
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
  let remainingTime = Math.max(0, playbackTime);

  for (const range of playableRanges) {
    const rangeDuration = (range.end - range.start) / playbackRate;

    if (remainingTime <= rangeDuration) {
      return Math.min(range.end, range.start + remainingTime * playbackRate);
    }

    remainingTime -= rangeDuration;
  }

  return playableRanges.at(-1)?.end ?? trimRange.end;
}
