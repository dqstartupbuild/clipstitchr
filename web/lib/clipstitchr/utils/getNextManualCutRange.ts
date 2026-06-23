import { VIDEO_TRIM_MIN_DURATION } from "@/lib/clipstitchr/constants/videoTrimBounds";
import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import { normalizeQuickEditRemoveRanges } from "@/lib/clipstitchr/utils/normalizeQuickEditRemoveRanges";

export function getNextManualCutRange(
  removeRanges: QuickEditRemoveRange[],
  duration: number,
) {
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;

  if (safeDuration <= VIDEO_TRIM_MIN_DURATION) {
    return null;
  }

  const normalizedRanges = normalizeQuickEditRemoveRanges(
    removeRanges,
    safeDuration,
  );
  let cursor = 0;

  for (const range of normalizedRanges) {
    if (range.start - cursor >= VIDEO_TRIM_MIN_DURATION) {
      return {
        start: cursor,
        end: Math.min(range.start, cursor + 1),
      };
    }

    cursor = Math.max(cursor, range.end);
  }

  if (safeDuration - cursor >= VIDEO_TRIM_MIN_DURATION) {
    return {
      start: cursor,
      end: Math.min(safeDuration, cursor + 1),
    };
  }

  return null;
}
