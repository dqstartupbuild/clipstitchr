import type { PostBridgeBatchPreparedItem } from "@/lib/clipstitchr/types/PostBridgeBatchPreparedItem";

export type PostBridgeBatchJobInput = {
  items: PostBridgeBatchPreparedItem[];
  socialAccountIds: number[];
};
