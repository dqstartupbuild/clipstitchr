import type { StitchSequenceSegment } from "@/lib/clipstitchr/types/StitchSequenceSegment";
import { getOrderedStitchSequenceSegments } from "@/lib/clipstitchr/utils/getOrderedStitchSequenceSegments";

export function getStitchSequenceDuration(
  segments: StitchSequenceSegment[] = [],
) {
  return getOrderedStitchSequenceSegments(segments).reduce(
    (duration, segment) => duration + segment.duration,
    0,
  );
}
