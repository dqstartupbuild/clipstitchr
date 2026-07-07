import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";

export function getDemoAgentRecordingTimeLimitReached(input: {
  nowMs: number;
  policy: DemoAgentPolicy;
  startedAtMs: number;
}) {
  return input.nowMs - input.startedAtMs >= input.policy.maxRecordingSeconds * 1000;
}
