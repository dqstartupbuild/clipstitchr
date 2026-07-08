import type { DemoAgentPageObservation } from "./DemoAgentPageObservation.js";
import { getDemoAgentObservedElementMatchesText } from "./getDemoAgentObservedElementMatchesText.js";

export function getDemoAgentUploadTargetVisibleInObservation({
  label,
  observation,
  text,
}: {
  label?: string;
  observation: DemoAgentPageObservation;
  text?: string;
}) {
  if (!label && !text) {
    return true;
  }

  return observation.inputs.some((element) =>
    getDemoAgentObservedElementMatchesText({
      allowPartial: true,
      element,
      text: label ?? text,
    }),
  );
}
