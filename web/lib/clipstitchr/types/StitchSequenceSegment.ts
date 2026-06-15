import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type StitchSequenceSegment = {
  clipId: string;
  clipName: string;
  clipType: ClipType;
  duration: number;
  order: number;
  playbackRate?: VideoPlaybackRate;
  quickEdit?: QuickEditSuggestions;
  trimRange: VideoTrimRange;
};
