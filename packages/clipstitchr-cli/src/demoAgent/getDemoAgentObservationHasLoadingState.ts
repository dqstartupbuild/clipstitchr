import type { DemoAgentPageObservation } from "./DemoAgentPageObservation.js";
import { getDemoAgentObservationTexts } from "./getDemoAgentObservationTexts.js";

export function getDemoAgentObservationHasLoadingState(
  observation: DemoAgentPageObservation,
) {
  return getDemoAgentObservationTexts(observation).some((text) =>
    /loading|processing|please wait|almost ready|working/i.test(text ?? ""),
  );
}
