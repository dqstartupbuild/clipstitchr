import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type StitchSourceSettingsUpdate = {
  demoClipId: string;
  demoClipName: string;
  demoCropBounds: VideoCropBounds;
  demoPlaybackRate: VideoPlaybackRate;
  demoTrimRange: VideoTrimRange;
  duration: number;
  name: string;
  ugcClipId: string;
  ugcClipName: string;
  ugcCropBounds: VideoCropBounds;
  ugcPlaybackRate: VideoPlaybackRate;
  ugcTrimRange: VideoTrimRange;
};
