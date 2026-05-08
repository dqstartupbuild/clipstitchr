import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";

export function getDefaultVideoTrimRange(clip: VideoClipMetadata) {
  return clampVideoTrimRange(
    clip.defaultTrimRange ?? {
      start: 0,
      end: clip.duration,
    },
    clip.duration,
  );
}
