import type { VideoClip } from "@/lib/clipr/types/VideoClip";
import { clampVideoTrimRange } from "@/lib/clipr/utils/clampVideoTrimRange";

export function getDefaultVideoTrimRange(clip: VideoClip) {
  return clampVideoTrimRange(
    clip.defaultTrimRange ?? {
      start: 0,
      end: clip.duration,
    },
    clip.duration,
  );
}
