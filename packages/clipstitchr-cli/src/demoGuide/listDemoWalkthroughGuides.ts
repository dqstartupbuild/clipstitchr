import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";
import { getDemoWalkthroughGuidesDirectoryPath } from "./getDemoWalkthroughGuidesDirectoryPath.js";
import { readDemoWalkthroughGuide } from "./readDemoWalkthroughGuide.js";

export async function listDemoWalkthroughGuides(cwd = process.cwd()) {
  const directoryPath = getDemoWalkthroughGuidesDirectoryPath(cwd);

  try {
    const fileNames = await readdir(directoryPath);
    const guides: DemoWalkthroughGuide[] = [];

    for (const fileName of fileNames.filter((name) => name.endsWith(".json"))) {
      try {
        guides.push(await readDemoWalkthroughGuide(join(directoryPath, fileName)));
      } catch {
        // Ignore hand-edited guide files that no longer parse.
      }
    }

    return guides.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}
