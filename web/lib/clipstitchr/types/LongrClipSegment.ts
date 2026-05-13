import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type LongrClipSegment = {
  clipId: string;
  clipName: string;
  clipType: ClipType;
  duration: number;
  order: number;
  trimRange: VideoTrimRange;
};
