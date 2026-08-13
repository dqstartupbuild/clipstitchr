import type { LazyReelWorkflowManifestItem } from "./LazyReelWorkflowManifestItem";
import type { LazyReelWorkflowStage } from "./LazyReelWorkflowStage";

export type LazyReelWorkflowResultData = {
  executionStatus: "plan_only";
  manifest: LazyReelWorkflowManifestItem[];
  outputContract: string[];
  providerRequirements: string[];
  stages: LazyReelWorkflowStage[];
  targetDurationSeconds: number;
};
