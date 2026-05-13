import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type LongrSequenceClip = {
  clip: VideoClip;
  trimRange: VideoTrimRange;
};
