import { SWAPR_REFERENCE_SEGMENT_MAX_DURATION_SECONDS } from "@/lib/clipstitchr/constants/swaprReferenceSegmentMaxDurationSeconds";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export function createSwaprReferenceSegments(
  durationSeconds: number,
): VideoTrimRange[] {
  const safeDuration = Number.isFinite(durationSeconds)
    ? Math.max(0, durationSeconds)
    : 0;

  if (safeDuration === 0) {
    return [];
  }

  const segmentCount = Math.max(
    1,
    Math.ceil(safeDuration / SWAPR_REFERENCE_SEGMENT_MAX_DURATION_SECONDS),
  );
  const segmentDuration = safeDuration / segmentCount;

  return Array.from({ length: segmentCount }, (_, index) => {
    const start = index * segmentDuration;
    const end = index === segmentCount - 1 ? safeDuration : start + segmentDuration;

    return { start, end };
  });
}
