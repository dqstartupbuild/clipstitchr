import { join } from "node:path";
import type { ProjectPackageJson } from "./readPackageJson.js";
import { pathExists } from "./pathExists.js";

export async function detectProjectType(
  packageJson: ProjectPackageJson | null,
  cwd = process.cwd(),
) {
  const dependencies = {
    ...(packageJson?.dependencies ?? {}),
    ...(packageJson?.devDependencies ?? {}),
  };

  if (dependencies.expo) {
    return "expo" as const;
  }

  if (dependencies.electron) {
    return "electron" as const;
  }

  if (dependencies["react-native"]) {
    return "react-native" as const;
  }

  if (await pathExists(join(cwd, "ios"))) {
    return "ios" as const;
  }

  if (await pathExists(join(cwd, "android"))) {
    return "android" as const;
  }

  return "web" as const;
}
