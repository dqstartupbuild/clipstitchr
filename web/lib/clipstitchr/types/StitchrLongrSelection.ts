import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type StitchrLongrSelection = {
  clip: VideoClipMetadata;
  cropBounds?: VideoCropBounds;
  playbackRate?: VideoPlaybackRate;
  trimRange: VideoTrimRange;
};
