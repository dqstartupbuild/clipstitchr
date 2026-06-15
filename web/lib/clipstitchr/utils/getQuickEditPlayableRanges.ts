import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clamp } from "@/lib/clipstitchr/utils/clamp";
import { normalizeQuickEditRemoveRanges } from "@/lib/clipstitchr/utils/normalizeQuickEditRemoveRanges";

export function getQuickEditPlayableRanges(
  trimRange: VideoTrimRange,
  duration: number,
  removeRanges: QuickEditRemoveRange[] = [],
) {
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const start = Number.isFinite(trimRange.start)
    ? clamp(trimRange.start, 0, safeDuration)
    : 0;
  const end = Number.isFinite(trimRange.end)
    ? clamp(trimRange.end, start, safeDuration)
    : safeDuration;
  const clampedTrimRange = { start, end };

  if (end <= start) {
    return [];
  }

  const intersectingRemoveRanges = normalizeQuickEditRemoveRanges(
    removeRanges,
    duration,
  ).flatMap((range) => {
    const start = Math.max(clampedTrimRange.start, range.start);
    const end = Math.min(clampedTrimRange.end, range.end);

    return end > start ? [{ start, end }] : [];
  });
  const playableRanges: VideoTrimRange[] = [];
  let cursor = clampedTrimRange.start;

  for (const range of intersectingRemoveRanges) {
    if (range.start > cursor) {
      playableRanges.push({
        start: cursor,
        end: range.start,
      });
    }

    cursor = Math.max(cursor, range.end);
  }

  if (cursor < clampedTrimRange.end) {
    playableRanges.push({
      start: cursor,
      end: clampedTrimRange.end,
    });
  }

  return playableRanges;
}
