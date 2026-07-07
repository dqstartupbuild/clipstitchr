import { join } from "node:path";
import { clipstitchrDirectoryName } from "../config/clipstitchrDirectoryName.js";

export function getDemoAgentRunsDirectoryPath(cwd = process.cwd()) {
  return join(cwd, clipstitchrDirectoryName, "agent-runs");
}
