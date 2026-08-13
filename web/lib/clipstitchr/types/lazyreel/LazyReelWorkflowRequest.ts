import type { LazyReelWorkflowKey } from "./LazyReelWorkflowKey";

export type LazyReelWorkflowRequest = {
  brief: string;
  product?: string;
  targetDurationSeconds?: number;
  workflow: LazyReelWorkflowKey;
};
