import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { appContextIgnoredDirectoryNames } from "./appContextIgnoredDirectoryNames.js";
import { getIsAppContextSourceFile } from "./getIsAppContextSourceFile.js";

export async function walkAppContextSourceFiles(
  current: string,
  files: string[],
) {
  const entries = await readdir(current, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(current, entry.name);

    if (entry.isDirectory()) {
      if (!appContextIgnoredDirectoryNames.has(entry.name)) {
        await walkAppContextSourceFiles(entryPath, files);
      }
      continue;
    }

    if (entry.isFile() && getIsAppContextSourceFile(entry.name)) {
      files.push(entryPath);
    }
  }
}
