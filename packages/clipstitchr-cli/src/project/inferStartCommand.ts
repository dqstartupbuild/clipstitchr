import type { ProjectPackageJson } from "./readPackageJson.js";
import type { DetectedProject } from "./DetectedProject.js";
import { getPackageManagerRunCommand } from "./getPackageManagerRunCommand.js";

export function inferStartCommand(
  packageJson: ProjectPackageJson | null,
  packageManager: DetectedProject["packageManager"],
) {
  const scripts = packageJson?.scripts ?? {};

  for (const scriptName of ["dev", "start", "web"]) {
    if (scripts[scriptName]) {
      return getPackageManagerRunCommand(packageManager, scriptName);
    }
  }

  return undefined;
}
