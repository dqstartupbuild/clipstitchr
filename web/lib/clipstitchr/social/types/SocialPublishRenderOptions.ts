import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { SocialPlatform } from "./SocialPlatform";

export type SocialPublishRenderOptions = {
  musicTrack: SharedMusicTrack | null;
  onProgress: (progress: number) => void;
  platforms: SocialPlatform[];
};
