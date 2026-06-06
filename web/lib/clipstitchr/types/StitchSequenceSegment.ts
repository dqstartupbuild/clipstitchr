import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type StitchSequenceSegment = {
  clipId: string;
  clipName: string;
  clipType: ClipType;
  duration: number;
  order: number;
  cropBounds?: VideoCropBounds;
  playbackRate?: VideoPlaybackRate;
  trimRange: VideoTrimRange;
};
