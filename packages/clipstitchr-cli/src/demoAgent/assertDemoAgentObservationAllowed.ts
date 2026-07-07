import type { DemoAgentPageObservation } from "./DemoAgentPageObservation.js";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import { assertDemoAgentTextAllowed } from "./assertDemoAgentTextAllowed.js";
import { getDemoAgentObservationTexts } from "./getDemoAgentObservationTexts.js";

export function assertDemoAgentObservationAllowed(
  policy: DemoAgentPolicy,
  observation: DemoAgentPageObservation,
) {
  for (const text of getDemoAgentObservationTexts(observation)) {
    if (text) {
      assertDemoAgentTextAllowed(policy, text);
    }
  }
}
