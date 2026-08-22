import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

export type StitchPreviewSources = {
  cacheKey: string;
  demoClip: VideoClip;
  sequenceClips?: VideoClip[];
  ugcClip: VideoClip;
};
