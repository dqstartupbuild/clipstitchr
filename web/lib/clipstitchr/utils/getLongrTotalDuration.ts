import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

export function getLongrTotalDuration(clips: VideoClipMetadata[]) {
  return clips.reduce(
    (total, clip) =>
      total + getVideoTrimRangeDuration(getDefaultVideoTrimRange(clip)),
    0,
  );
}
