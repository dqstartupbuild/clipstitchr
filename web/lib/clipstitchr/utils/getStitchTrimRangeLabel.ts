import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

export function getStitchTrimRangeLabel(trimRange?: VideoTrimRange) {
  if (!trimRange) {
    return undefined;
  }

  return `${formatDuration(trimRange.start)} - ${formatDuration(
    trimRange.end,
  )} (${formatDuration(getVideoTrimRangeDuration(trimRange))})`;
}
