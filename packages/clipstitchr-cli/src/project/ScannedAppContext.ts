import type { ScannedFlow } from "./ScannedFlow.js";
import type { ScannedWorkflowHint } from "./ScannedWorkflowHint.js";

export type ScannedAppContext = {
  generatedAt: string;
  projectDirectory: string;
  projectType: string;
  routes: ScannedFlow[];
  version: 1;
  workflowHints: ScannedWorkflowHint[];
};
