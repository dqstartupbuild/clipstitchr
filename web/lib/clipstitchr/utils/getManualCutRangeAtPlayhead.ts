import { VIDEO_TRIM_MIN_DURATION } from "@/lib/clipstitchr/constants/videoTrimBounds";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clamp } from "@/lib/clipstitchr/utils/clamp";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";

type GetManualCutRangeAtPlayheadOptions = {
  duration: number;
  playheadSeconds: number;
  trimRange: VideoTrimRange;
};

export function getManualCutRangeAtPlayhead({
  duration,
  playheadSeconds,
  trimRange,
}: GetManualCutRangeAtPlayheadOptions): VideoTrimRange | null {
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;

  if (safeDuration <= VIDEO_TRIM_MIN_DURATION) {
    return null;
  }

  const activeTrimRange = clampVideoTrimRange(trimRange, safeDuration);

  if (activeTrimRange.end - activeTrimRange.start <= VIDEO_TRIM_MIN_DURATION) {
    return null;
  }

  const safePlayhead = clamp(
    Number.isFinite(playheadSeconds) ? playheadSeconds : activeTrimRange.start,
    activeTrimRange.start,
    activeTrimRange.end,
  );
  const preferredCutDuration = Math.min(
    1,
    activeTrimRange.end - activeTrimRange.start,
  );
  const initialStart = clamp(
    safePlayhead,
    activeTrimRange.start,
    activeTrimRange.end - VIDEO_TRIM_MIN_DURATION,
  );
  const end = Math.min(activeTrimRange.end, initialStart + preferredCutDuration);
  const start = Math.max(activeTrimRange.start, end - preferredCutDuration);

  if (end - start < VIDEO_TRIM_MIN_DURATION) {
    return null;
  }

  return {
    end,
    start,
  };
}
