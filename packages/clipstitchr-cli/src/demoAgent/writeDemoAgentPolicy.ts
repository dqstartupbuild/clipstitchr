import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import { getDemoAgentPolicyPath } from "./getDemoAgentPolicyPath.js";

export async function writeDemoAgentPolicy(
  policy: DemoAgentPolicy,
  cwd = process.cwd(),
) {
  const policyPath = getDemoAgentPolicyPath(cwd);

  await mkdir(dirname(policyPath), { recursive: true });
  await writeFile(policyPath, `${JSON.stringify(policy, null, 2)}\n`, "utf8");

  return policyPath;
}
