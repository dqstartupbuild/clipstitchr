import { VIDEO_TRIM_MIN_DURATION } from "@/lib/clipr/constants/videoTrimBounds";
import type { VideoTrimRange } from "@/lib/clipr/types/VideoTrimRange";
import { clamp } from "@/lib/clipr/utils/clamp";

export function clampVideoTrimRange(
  trimRange: VideoTrimRange,
  duration: number,
): VideoTrimRange {
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;

  if (safeDuration <= VIDEO_TRIM_MIN_DURATION) {
    return {
      start: 0,
      end: safeDuration,
    };
  }

  const safeStart = Number.isFinite(trimRange.start) ? trimRange.start : 0;
  const safeEnd = Number.isFinite(trimRange.end) ? trimRange.end : safeDuration;
  const start = clamp(safeStart, 0, safeDuration - VIDEO_TRIM_MIN_DURATION);
  const end = clamp(
    safeEnd,
    start + VIDEO_TRIM_MIN_DURATION,
    safeDuration,
  );

  return {
    start,
    end,
  };
}
