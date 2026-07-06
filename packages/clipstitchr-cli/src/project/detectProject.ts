import { join } from "node:path";
import type { DetectedProject } from "./DetectedProject.js";
import { createStartCommandForDirectory } from "./createStartCommandForDirectory.js";
import { detectProjectType } from "./detectProjectType.js";
import { getPackageManager } from "./getPackageManager.js";
import { getProjectSearchDirectories } from "./getProjectSearchDirectories.js";
import { inferStartCommand } from "./inferStartCommand.js";
import { readPackageJson } from "./readPackageJson.js";

export async function detectProject(cwd = process.cwd()): Promise<DetectedProject> {
  const directories = await getProjectSearchDirectories(cwd);

  for (const directory of directories) {
    const projectCwd = join(cwd, directory);
    const packageJson = await readPackageJson(projectCwd);

    if (!packageJson) {
      continue;
    }

    const packageManager = await getPackageManager(projectCwd);
    const startCommand = inferStartCommand(packageJson, packageManager);

    return {
      directory,
      displayName: directory === "." ? "this folder" : directory,
      packageManager,
      startCommand: createStartCommandForDirectory(directory, startCommand),
      type: await detectProjectType(packageJson, projectCwd),
    };
  }

  const packageManager = await getPackageManager(cwd);

  return {
    directory: ".",
    displayName: "this folder",
    packageManager,
    startCommand: undefined,
    type: await detectProjectType(null, cwd),
  };
}
