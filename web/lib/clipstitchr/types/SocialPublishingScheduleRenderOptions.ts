import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

export type SocialPublishingScheduleRenderOptions = {
  musicTrack: SharedMusicTrack | null;
  onProgress: (progress: number) => void;
  platforms: SocialPublishingPlatform[];
};
