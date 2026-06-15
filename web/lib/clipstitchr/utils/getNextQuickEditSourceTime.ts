import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { getQuickEditPlayableRanges } from "@/lib/clipstitchr/utils/getQuickEditPlayableRanges";

export function getNextQuickEditSourceTime(
  sourceTime: number,
  trimRange: VideoTrimRange,
  duration: number,
  removeRanges: QuickEditRemoveRange[] = [],
) {
  const playableRanges = getQuickEditPlayableRanges(
    trimRange,
    duration,
    removeRanges,
  );

  for (const range of playableRanges) {
    if (sourceTime < range.start) {
      return range.start;
    }

    if (sourceTime <= range.end) {
      return sourceTime;
    }
  }

  return playableRanges.at(-1)?.end ?? trimRange.end;
}
