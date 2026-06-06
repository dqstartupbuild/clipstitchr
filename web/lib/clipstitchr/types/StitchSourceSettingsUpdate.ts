import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type StitchSourceSettingsUpdate = {
  demoClipId: string;
  demoClipName: string;
  demoPlaybackRate: VideoPlaybackRate;
  demoTrimRange: VideoTrimRange;
  duration: number;
  name: string;
  ugcClipId: string;
  ugcClipName: string;
  ugcPlaybackRate: VideoPlaybackRate;
  ugcTrimRange: VideoTrimRange;
};
