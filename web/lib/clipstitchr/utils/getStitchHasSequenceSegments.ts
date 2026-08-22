import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

export function getStitchHasSequenceSegments(stitch: Stitch) {
  return Boolean(stitch.sequenceSegments?.length);
}
