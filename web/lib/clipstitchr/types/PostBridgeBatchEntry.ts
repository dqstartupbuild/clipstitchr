import type { PostBridgeBatchQueueItem } from "@/lib/clipstitchr/types/PostBridgeBatchQueueItem";

export type PostBridgeBatchEntry = {
  caption: string;
  item: PostBridgeBatchQueueItem;
};
