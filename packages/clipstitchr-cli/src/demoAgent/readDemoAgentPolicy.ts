import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { getDemoAgentPolicyPath } from "./getDemoAgentPolicyPath.js";
import { normalizeDemoAgentPolicy } from "./normalizeDemoAgentPolicy.js";

export async function readDemoAgentPolicy(cwd = process.cwd()) {
  const policyPath = getDemoAgentPolicyPath(cwd);
  const contents = await readFile(policyPath, "utf8");

  return {
    hash: createHash("sha256").update(contents).digest("hex"),
    path: policyPath,
    policy: normalizeDemoAgentPolicy(JSON.parse(contents), cwd),
  };
}
