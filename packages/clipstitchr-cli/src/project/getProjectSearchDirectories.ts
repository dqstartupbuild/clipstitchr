import { join } from "node:path";
import { pathExists } from "./pathExists.js";
import { projectSearchDirectories } from "./projectSearchDirectories.js";

export async function getProjectSearchDirectories(cwd = process.cwd()) {
  const directories: string[] = [];

  for (const directory of projectSearchDirectories) {
    if (await pathExists(join(cwd, directory))) {
      directories.push(directory);
    }
  }

  return directories;
}
