import type { VideoTrimRange } from "@/lib/clipr/types/VideoTrimRange";

export function getVideoTrimRangeDuration(trimRange: VideoTrimRange) {
  return Math.max(0, trimRange.end - trimRange.start);
}
