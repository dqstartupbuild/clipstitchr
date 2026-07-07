import type { DetectedProject } from "./DetectedProject.js";
import type { ScannedFlow } from "./ScannedFlow.js";
import type { ScannedAppContext } from "./ScannedAppContext.js";
import { scanProjectWorkflowHints } from "./scanProjectWorkflowHints.js";

export async function createScannedAppContext(input: {
  project: DetectedProject;
  projectCwd: string;
  routes: ScannedFlow[];
}): Promise<ScannedAppContext> {
  return {
    generatedAt: new Date().toISOString(),
    projectDirectory: input.project.directory,
    projectType: input.project.type,
    routes: input.routes,
    version: 1,
    workflowHints: await scanProjectWorkflowHints(input.projectCwd),
  };
}
