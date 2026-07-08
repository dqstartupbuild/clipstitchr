import { waitForMilliseconds } from "../utils/waitForMilliseconds.js";
import { demoAgentPlannerMinimumRequestIntervalMs } from "./demoAgentPlannerMinimumRequestIntervalMs.js";

let lastDemoAgentPlannerRequestStartedAtMs = 0;

export async function waitForDemoAgentPlannerRequestSlot() {
  const now = Date.now();
  const elapsedMs = now - lastDemoAgentPlannerRequestStartedAtMs;
  const waitMs = Math.max(0, demoAgentPlannerMinimumRequestIntervalMs - elapsedMs);

  if (waitMs > 0) {
    await waitForMilliseconds(waitMs);
  }

  lastDemoAgentPlannerRequestStartedAtMs = Date.now();
}
