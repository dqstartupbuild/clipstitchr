import { createHash } from "node:crypto";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";

export function createDemoAgentPolicyHash(policy: DemoAgentPolicy) {
  return createHash("sha256")
    .update(JSON.stringify(policy))
    .digest("hex");
}
