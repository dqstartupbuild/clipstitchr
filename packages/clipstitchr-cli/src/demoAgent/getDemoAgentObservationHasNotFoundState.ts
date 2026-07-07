import type { DemoAgentPageObservation } from "./DemoAgentPageObservation.js";
import { getDemoAgentObservationTexts } from "./getDemoAgentObservationTexts.js";

export function getDemoAgentObservationHasNotFoundState(
  observation: DemoAgentPageObservation,
) {
  return getDemoAgentObservationTexts(observation).some((text) =>
    /\b404\b|not found|page missing|page does not exist/i.test(text ?? ""),
  );
}
