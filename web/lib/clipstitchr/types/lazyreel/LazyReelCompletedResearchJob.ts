import type { LazyReelToolResult } from "./LazyReelToolResult";
import type { LazyReelWorkflowResult } from "./LazyReelWorkflowResult";

export type LazyReelCompletedResearchJob =
  | {
      kind: "tool";
      result: LazyReelToolResult;
      runId: string;
    }
  | {
      kind: "workflow";
      result: LazyReelWorkflowResult;
      runId: string;
    };
