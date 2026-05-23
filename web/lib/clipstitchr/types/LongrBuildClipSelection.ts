import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type LongrBuildClipSelection = {
  clip: VideoClipMetadata;
  loadClip: () => Promise<VideoClip | null>;
  playbackRate?: VideoPlaybackRate;
  trimRange: VideoTrimRange;
};
