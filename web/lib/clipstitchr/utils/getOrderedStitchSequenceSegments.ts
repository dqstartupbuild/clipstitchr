import type { StitchSequenceSegment } from "@/lib/clipstitchr/types/StitchSequenceSegment";

export function getOrderedStitchSequenceSegments(
  segments: StitchSequenceSegment[] = [],
) {
  return [...segments].sort((left, right) => left.order - right.order);
}
