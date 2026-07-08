import type { DemoAgentPageObservation } from "./DemoAgentPageObservation.js";
import { getDemoAgentObservedElementMatchesText } from "./getDemoAgentObservedElementMatchesText.js";

export function getDemoAgentTypeTargetVisibleInObservation({
  label,
  observation,
}: {
  label: string;
  observation: DemoAgentPageObservation;
}) {
  return observation.inputs.some((element) =>
    getDemoAgentObservedElementMatchesText({
      allowPartial: true,
      element,
      text: label,
    }),
  );
}
