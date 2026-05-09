import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type StitchrUgcSelection = {
  clip: VideoClipMetadata;
  trimRange: VideoTrimRange;
  loadClip: () => Promise<VideoClip | null>;
};
