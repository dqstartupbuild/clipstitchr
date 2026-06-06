import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type StitchrSequenceClip = {
  clip: VideoClip;
  cropBounds?: VideoCropBounds;
  includeAudio: boolean;
  playbackRate?: VideoPlaybackRate;
  trimRange: VideoTrimRange;
};
