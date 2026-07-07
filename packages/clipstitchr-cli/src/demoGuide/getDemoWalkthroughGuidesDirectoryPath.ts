import { join } from "node:path";
import { clipstitchrDirectoryName } from "../config/clipstitchrDirectoryName.js";

export function getDemoWalkthroughGuidesDirectoryPath(cwd = process.cwd()) {
  return join(cwd, clipstitchrDirectoryName, "demo-guides");
}
