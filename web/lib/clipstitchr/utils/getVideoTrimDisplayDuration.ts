import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

export function getVideoTrimDisplayDuration(
  duration: number,
  trimRange?: VideoTrimRange | null,
) {
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;

  if (!trimRange) {
    return safeDuration;
  }

  return Math.min(safeDuration, getVideoTrimRangeDuration(trimRange));
}
