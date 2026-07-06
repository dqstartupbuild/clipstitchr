import type { DetectedProject } from "./DetectedProject.js";

export function getPackageManagerRunCommand(
  packageManager: DetectedProject["packageManager"],
  scriptName: string,
) {
  if (packageManager === "npm") {
    return `npm run ${scriptName}`;
  }

  return `${packageManager} ${scriptName}`;
}
