import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import { clamp } from "@/lib/clipstitchr/utils/clamp";

export function normalizeQuickEditRemoveRanges(
  removeRanges: QuickEditRemoveRange[] = [],
  duration: number,
) {
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const sortedRanges = removeRanges
    .flatMap((range) => {
      const start = Number.isFinite(range.start)
        ? clamp(range.start, 0, safeDuration)
        : 0;
      const end = Number.isFinite(range.end)
        ? clamp(range.end, 0, safeDuration)
        : 0;

      return end > start ? [{ ...range, start, end }] : [];
    })
    .sort((left, right) => left.start - right.start);
  const mergedRanges: QuickEditRemoveRange[] = [];

  for (const range of sortedRanges) {
    const previousRange = mergedRanges.at(-1);

    if (!previousRange || range.start > previousRange.end) {
      mergedRanges.push(range);
      continue;
    }

    previousRange.end = Math.max(previousRange.end, range.end);
    previousRange.reason = previousRange.reason || range.reason;
  }

  return mergedRanges;
}
