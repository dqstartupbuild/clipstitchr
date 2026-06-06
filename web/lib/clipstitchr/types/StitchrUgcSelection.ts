import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type StitchrUgcSelection = {
  clip: VideoClipMetadata;
  textOverlay?: TextOverlay | null;
  textOverlays?: TextOverlay[] | null;
  cropBounds?: VideoCropBounds;
  trimRange: VideoTrimRange;
};
