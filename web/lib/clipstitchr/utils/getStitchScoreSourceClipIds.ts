import type { StitchSequenceSegment } from "@/lib/clipstitchr/types/StitchSequenceSegment";
import { getOrderedStitchSequenceSegments } from "@/lib/clipstitchr/utils/getOrderedStitchSequenceSegments";

type StitchScoreSourceClipIdsInput = {
  demoClipId: string;
  sequenceSegments?: StitchSequenceSegment[];
  ugcClipId: string;
};

export function getStitchScoreSourceClipIds({
  demoClipId,
  sequenceSegments,
  ugcClipId,
}: StitchScoreSourceClipIdsInput) {
  if (sequenceSegments?.length) {
    return getOrderedStitchSequenceSegments(sequenceSegments).map(
      (segment) => segment.clipId,
    );
  }

  return [ugcClipId, demoClipId].filter(Boolean);
}
