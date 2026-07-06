import { mkdir } from "node:fs/promises";
import { join } from "node:path";

export async function createBrowserProfileDirectory(cwd = process.cwd()) {
  const directory = join(cwd, ".clipstitchr", "browser-profile");

  await mkdir(directory, { recursive: true });

  return directory;
}
