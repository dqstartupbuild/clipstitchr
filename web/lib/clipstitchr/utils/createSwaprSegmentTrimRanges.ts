import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export function createSwaprSegmentTrimRanges(
  duration: number,
  maxSegmentDuration: number,
): VideoTrimRange[] {
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const safeMaxSegmentDuration =
    Number.isFinite(maxSegmentDuration) && maxSegmentDuration > 0
      ? maxSegmentDuration
      : safeDuration;

  if (safeDuration <= 0) {
    return [];
  }

  const segmentCount = Math.max(
    1,
    Math.ceil(safeDuration / safeMaxSegmentDuration),
  );
  const segmentDuration = safeDuration / segmentCount;

  return Array.from({ length: segmentCount }, (_, index) => {
    const start = index * segmentDuration;
    const end = index === segmentCount - 1 ? safeDuration : start + segmentDuration;

    return { start, end };
  });
}
