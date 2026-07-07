import type { DemoAgentPageObservation } from "./DemoAgentPageObservation.js";
import { getDemoAgentTextMatchesStep } from "./getDemoAgentTextMatchesStep.js";

export function findDemoAgentInputTarget(
  observation: DemoAgentPageObservation,
  stepLabel: string,
) {
  return (
    observation.inputs.find((element) =>
      getDemoAgentTextMatchesStep(element.label ?? element.name, stepLabel),
    ) ?? null
  );
}
