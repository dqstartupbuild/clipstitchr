import type { DetectedProject } from "./DetectedProject.js";
import { detectProjectType } from "./detectProjectType.js";
import { getPackageManager } from "./getPackageManager.js";
import { inferStartCommand } from "./inferStartCommand.js";
import { readPackageJson } from "./readPackageJson.js";

export async function detectProject(cwd = process.cwd()): Promise<DetectedProject> {
  const packageJson = await readPackageJson(cwd);
  const packageManager = await getPackageManager(cwd);

  return {
    packageManager,
    startCommand: inferStartCommand(packageJson, packageManager),
    type: await detectProjectType(packageJson, cwd),
  };
}
