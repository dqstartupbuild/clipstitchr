import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";

export function assertDemoAgentTextAllowed(
  policy: DemoAgentPolicy,
  text: string,
) {
  for (const pattern of policy.blockedTextPatterns) {
    if (new RegExp(pattern, "i").test(text)) {
      throw new Error(`The agent stopped before a blocked action: ${pattern}.`);
    }
  }
}
