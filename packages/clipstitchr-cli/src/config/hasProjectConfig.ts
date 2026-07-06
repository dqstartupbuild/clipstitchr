import { access } from "node:fs/promises";
import { getProjectConfigPath } from "./getProjectConfigPath.js";

export async function hasProjectConfig(cwd = process.cwd()) {
  try {
    await access(getProjectConfigPath(cwd));
    return true;
  } catch {
    return false;
  }
}
