import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

export function getStitchIsLongr(stitch: Stitch) {
  return stitch.mode === "longr" && Boolean(stitch.sequenceSegments?.length);
}
