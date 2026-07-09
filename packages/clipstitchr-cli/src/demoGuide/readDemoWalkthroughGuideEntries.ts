import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { DemoWalkthroughGuideEntry } from "./DemoWalkthroughGuideEntry.js";
import { getDemoWalkthroughGuidesDirectoryPath } from "./getDemoWalkthroughGuidesDirectoryPath.js";
import { readDemoWalkthroughGuide } from "./readDemoWalkthroughGuide.js";

export async function readDemoWalkthroughGuideEntries(cwd = process.cwd()) {
  const directoryPath = getDemoWalkthroughGuidesDirectoryPath(cwd);

  try {
    const fileNames = await readdir(directoryPath);
    const entries: DemoWalkthroughGuideEntry[] = [];

    for (const fileName of fileNames.filter((name) => name.endsWith(".json"))) {
      const filePath = join(directoryPath, fileName);

      try {
        entries.push({
          guide: await readDemoWalkthroughGuide(filePath),
          path: filePath,
        });
      } catch {
        // Ignore hand-edited guide files that no longer parse.
      }
    }

    return entries;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}
