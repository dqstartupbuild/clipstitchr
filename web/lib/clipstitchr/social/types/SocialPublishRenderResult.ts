import type { PostBridgeScheduleMediaFile } from "@/lib/clipstitchr/types/PostBridgeScheduleMediaFile";

export type SocialPublishRenderResult = {
  hasAudio: boolean;
  mediaFiles: PostBridgeScheduleMediaFile[];
};
