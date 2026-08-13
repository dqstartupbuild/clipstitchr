import type { LazyReelWorkflowRequest } from "./LazyReelWorkflowRequest";

export type StudioLazyReelWorkflowRunRequest = {
  idempotencyKey: string;
  productId: string;
  request: LazyReelWorkflowRequest;
};
