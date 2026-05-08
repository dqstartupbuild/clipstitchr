import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";

export function getDefaultVideoTrimRange(clip: VideoClip) {
  return clampVideoTrimRange(
    clip.defaultTrimRange ?? {
      start: 0,
      end: clip.duration,
    },
    clip.duration,
  );
}
