import { join } from "node:path";
import type { DetectedProject } from "./DetectedProject.js";
import { createScannedAppContext } from "./createScannedAppContext.js";
import type { ScannedFlow } from "./ScannedFlow.js";
import { scanProjectFlows } from "./scanProjectFlows.js";
import { writeScannedAppContext } from "./writeScannedAppContext.js";

export async function scanAndWriteAppContext(input: {
  cwd?: string;
  flows?: ScannedFlow[];
  project: DetectedProject;
}) {
  const cwd = input.cwd ?? process.cwd();
  const projectCwd = join(cwd, input.project.directory);
  const routes = input.flows ?? (await scanProjectFlows(projectCwd));
  const appContext = await createScannedAppContext({
    project: input.project,
    projectCwd,
    routes,
  });

  await writeScannedAppContext(appContext, cwd);

  return appContext;
}
