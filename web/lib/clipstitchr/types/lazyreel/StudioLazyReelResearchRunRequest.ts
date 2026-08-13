import type { LazyReelToolRequest } from "./LazyReelToolRequest";

export type StudioLazyReelResearchRunRequest = {
  idempotencyKey: string;
  productId: string;
  request: LazyReelToolRequest;
};
