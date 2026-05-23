import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type LongrSequenceClip = {
  clip: VideoClip;
  playbackRate?: VideoPlaybackRate;
  trimRange: VideoTrimRange;
};
