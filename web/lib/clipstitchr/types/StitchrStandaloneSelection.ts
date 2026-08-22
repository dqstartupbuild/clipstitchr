import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type StitchrStandaloneSelection = {
  clip: VideoClipMetadata;
  socialCaption?: string;
  textOverlays?: TextOverlay[];
  trimRange: VideoTrimRange;
};
