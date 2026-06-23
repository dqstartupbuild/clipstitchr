import { VIDEO_TRIM_MIN_DURATION } from "@/lib/clipstitchr/constants/videoTrimBounds";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clamp } from "@/lib/clipstitchr/utils/clamp";

type GetVideoCutRangeFromMarkedTimesOptions = {
  duration: number;
  endSeconds: number;
  startSeconds: number;
};

export function getVideoCutRangeFromMarkedTimes({
  duration,
  endSeconds,
  startSeconds,
}: GetVideoCutRangeFromMarkedTimesOptions): VideoTrimRange | null {
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;

  if (safeDuration <= VIDEO_TRIM_MIN_DURATION) {
    return null;
  }

  const start = clamp(
    Math.min(startSeconds, endSeconds),
    0,
    safeDuration,
  );
  const end = clamp(
    Math.max(startSeconds, endSeconds),
    0,
    safeDuration,
  );

  if (end - start < VIDEO_TRIM_MIN_DURATION) {
    return null;
  }

  return {
    end,
    start,
  };
}
