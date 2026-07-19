import type { PostBridgeBatchPreparedMedia } from "@/lib/clipstitchr/types/PostBridgeBatchPreparedMedia";
import type { PostBridgeSourceType } from "@/lib/clipstitchr/types/PostBridgeSourceType";

export type PostBridgeBatchPreparedItem = {
  caption: string;
  hasAudio: boolean;
  mediaFiles: PostBridgeBatchPreparedMedia[];
  sourceId: string;
  sourceType: PostBridgeSourceType;
  title: string;
};
