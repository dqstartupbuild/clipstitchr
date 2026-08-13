import type { LazyReelWorkflowKey } from "./LazyReelWorkflowKey";
import type { LazyReelWorkflowStage } from "./LazyReelWorkflowStage";

export type LazyReelWorkflowDefinition = {
  activation: string[];
  inputs: string[];
  key: LazyReelWorkflowKey;
  limitations: string[];
  outputSections: string[];
  principles: string[];
  purpose: string;
  sourceFiles: string[];
  stages: LazyReelWorkflowStage[];
  title: string;
};
