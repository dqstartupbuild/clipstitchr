import type { PostBridgeScheduleMediaFile } from "@/lib/clipstitchr/types/PostBridgeScheduleMediaFile";

export type PostBridgeScheduleRenderResult = {
  hasAudio: boolean;
  mediaFiles: PostBridgeScheduleMediaFile[];
};
