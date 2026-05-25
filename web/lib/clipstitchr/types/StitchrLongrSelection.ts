import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type StitchrLongrSelection = {
  clip: VideoClipMetadata;
  playbackRate?: VideoPlaybackRate;
  trimRange: VideoTrimRange;
};
