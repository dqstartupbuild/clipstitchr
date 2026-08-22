import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

export function getStitchSegmentAudioLabel(
  segmentClipType: ClipType,
  stitch: Stitch,
) {
  const isIncluded =
    segmentClipType === "demo"
      ? stitch.includeDemoAudio !== false
      : stitch.includeUgcAudio !== false;

  return isIncluded ? "Included" : "Muted";
}
