import type { PostBridgePlatform } from "@/lib/clipstitchr/types/PostBridgePlatform";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

export type PostBridgeScheduleRenderOptions = {
  musicTrack: SharedMusicTrack | null;
  onProgress: (progress: number) => void;
  platforms: PostBridgePlatform[];
};
