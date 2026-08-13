import type { LazyReelCompletedResearchJob } from "./LazyReelCompletedResearchJob";
import type { LazyReelToolRequest } from "./LazyReelToolRequest";
import type { LazyReelWorkflowRequest } from "./LazyReelWorkflowRequest";

export type LazyReelJobRunnerState = {
  completedJob: LazyReelCompletedResearchJob | null;
  error: string | null;
  isRunning: boolean;
  reset: () => void;
  runTool: (request: LazyReelToolRequest) => Promise<void>;
  runWorkflow: (request: LazyReelWorkflowRequest) => Promise<void>;
};
