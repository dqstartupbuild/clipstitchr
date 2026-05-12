import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type VideoSequenceClip = {
  clip: VideoClip;
  trimRange: VideoTrimRange;
};
