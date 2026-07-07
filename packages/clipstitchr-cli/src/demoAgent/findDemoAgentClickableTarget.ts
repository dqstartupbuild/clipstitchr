import type { DemoAgentClickTarget } from "./DemoAgentClickTarget.js";
import type { DemoAgentPageObservation } from "./DemoAgentPageObservation.js";
import { getDemoAgentTextMatchesStep } from "./getDemoAgentTextMatchesStep.js";

export function findDemoAgentClickableTarget(
  observation: DemoAgentPageObservation,
  stepLabel: string,
): DemoAgentClickTarget | null {
  const button = observation.buttons.find((element) =>
    getDemoAgentTextMatchesStep(element.name, stepLabel),
  );

  if (button) {
    return {
      name: button.name,
      role: "button",
    };
  }

  const link = observation.links.find((element) =>
    getDemoAgentTextMatchesStep(element.name, stepLabel),
  );

  if (link) {
    return {
      name: link.name,
      role: "link",
    };
  }

  return null;
}
