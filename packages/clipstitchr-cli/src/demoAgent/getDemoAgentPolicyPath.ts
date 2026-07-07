import { join } from "node:path";
import { clipstitchrDirectoryName } from "../config/clipstitchrDirectoryName.js";

export function getDemoAgentPolicyPath(cwd = process.cwd()) {
  return join(cwd, clipstitchrDirectoryName, "demo-agent-policy.json");
}
