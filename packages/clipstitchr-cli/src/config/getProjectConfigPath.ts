import { join } from "node:path";
import { clipstitchrConfigFileName } from "./clipstitchrConfigFileName.js";

export function getProjectConfigPath(cwd = process.cwd()) {
  return join(cwd, clipstitchrConfigFileName);
}
