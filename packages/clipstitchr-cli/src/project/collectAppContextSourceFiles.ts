import { join } from "node:path";
import { appContextSourceRoots } from "./appContextSourceRoots.js";
import { pathExists } from "./pathExists.js";
import { walkAppContextSourceFiles } from "./walkAppContextSourceFiles.js";

export async function collectAppContextSourceFiles(projectCwd: string) {
  const files: string[] = [];

  for (const sourceRoot of appContextSourceRoots) {
    const absoluteRoot = join(projectCwd, sourceRoot);

    if (await pathExists(absoluteRoot)) {
      await walkAppContextSourceFiles(absoluteRoot, files);
    }
  }

  return Array.from(new Set(files)).sort().slice(0, 500);
}
