import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type LongrClipSegment = {
  clipId: string;
  clipName: string;
  clipType: ClipType;
  duration: number;
  order: number;
  playbackRate?: VideoPlaybackRate;
  trimRange: VideoTrimRange;
};
