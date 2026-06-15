export function getQuickEditPlaybackDuration({
  duration,
  playbackRate = 1,
  removeRanges = [],
  trimRange,
}) {
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const safePlaybackRate =
    Number.isFinite(playbackRate) && playbackRate > 0 ? playbackRate : 1;
  const start =
    Number.isFinite(trimRange?.start) && trimRange.start > 0
      ? Math.min(trimRange.start, safeDuration)
      : 0;
  const end =
    Number.isFinite(trimRange?.end) && trimRange.end >= start
      ? Math.min(trimRange.end, safeDuration)
      : safeDuration;
  const baseDuration = Math.max(0, end - start);
  const normalizedRemoveRanges = removeRanges
    .flatMap((range) => {
      if (!range || typeof range !== "object") {
        return [];
      }

      const rangeStart =
        Number.isFinite(range.start) && range.start > 0
          ? Math.min(range.start, safeDuration)
          : 0;
      const rangeEnd =
        Number.isFinite(range.end) && range.end >= rangeStart
          ? Math.min(range.end, safeDuration)
          : rangeStart;

      return rangeEnd > rangeStart
        ? [{ start: rangeStart, end: rangeEnd }]
        : [];
    })
    .sort((a, b) => a.start - b.start);
  let removedDuration = 0;
  let removeCursor = start;

  for (const range of normalizedRemoveRanges) {
    const rangeStart = Math.max(start, range.start, removeCursor);
    const rangeEnd = Math.min(end, range.end);

    if (rangeEnd > rangeStart) {
      removedDuration += rangeEnd - rangeStart;
      removeCursor = rangeEnd;
    }
  }

  return Math.max(0, baseDuration - removedDuration) / safePlaybackRate;
}
