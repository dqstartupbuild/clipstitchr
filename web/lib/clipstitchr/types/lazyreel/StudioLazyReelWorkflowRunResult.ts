import type { LazyReelWorkflowResult } from "./LazyReelWorkflowResult";

export type StudioLazyReelWorkflowRunResult = {
  created: boolean;
  result: LazyReelWorkflowResult;
  runId: string;
};
