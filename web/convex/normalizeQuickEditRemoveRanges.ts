type QuickEditRemoveRangeLike = {
  end: number;
  reason?: string;
  start: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function normalizeQuickEditRemoveRanges(
  removeRanges: QuickEditRemoveRangeLike[],
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
  const mergedRanges: QuickEditRemoveRangeLike[] = [];

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
