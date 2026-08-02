import type { PostBridgeScheduleRenderOptions } from "@/lib/clipstitchr/types/PostBridgeScheduleRenderOptions";
import type { PostBridgeScheduleRenderResult } from "@/lib/clipstitchr/types/PostBridgeScheduleRenderResult";
import type { PostBridgeSourceType } from "@/lib/clipstitchr/types/PostBridgeSourceType";

export type PostBridgeBatchQueueItem = {
  caption: string;
  id: string;
  productId?: string;
  sourceType: PostBridgeSourceType;
  title: string;
  renderMedia: (
    options: PostBridgeScheduleRenderOptions,
  ) => Promise<PostBridgeScheduleRenderResult>;
};
