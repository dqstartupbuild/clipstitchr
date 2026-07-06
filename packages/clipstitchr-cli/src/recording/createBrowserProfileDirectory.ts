import { mkdir } from "node:fs/promises";
import { getBrowserProfileDirectoryPath } from "./getBrowserProfileDirectoryPath.js";

export async function createBrowserProfileDirectory(cwd = process.cwd()) {
  const directory = getBrowserProfileDirectoryPath(cwd);

  await mkdir(directory, { recursive: true });

  return directory;
}
