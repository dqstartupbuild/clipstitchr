import { readdir } from "node:fs/promises";

export async function hasXcodeProject(cwd = process.cwd()) {
  try {
    const entries = await readdir(cwd);

    return entries.some(
      (entry) => entry.endsWith(".xcodeproj") || entry.endsWith(".xcworkspace"),
    );
  } catch {
    return false;
  }
}
