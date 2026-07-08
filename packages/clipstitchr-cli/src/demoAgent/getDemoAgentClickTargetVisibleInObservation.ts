import type { DemoAgentClickTarget } from "./DemoAgentClickTarget.js";
import type { DemoAgentPageObservation } from "./DemoAgentPageObservation.js";
import { getDemoAgentObservedElementMatchesText } from "./getDemoAgentObservedElementMatchesText.js";

export function getDemoAgentClickTargetVisibleInObservation({
  observation,
  target,
}: {
  observation: DemoAgentPageObservation;
  target: DemoAgentClickTarget;
}) {
  const targetText = target.name ?? target.text ?? target.label;

  if (target.role === "link") {
    return observation.links.some((element) =>
      getDemoAgentObservedElementMatchesText({ element, text: targetText }),
    );
  }

  if (target.role === "checkbox") {
    return observation.inputs.some((element) =>
      getDemoAgentObservedElementMatchesText({ element, text: targetText }),
    );
  }

  if (target.role) {
    return observation.buttons.some((element) =>
      getDemoAgentObservedElementMatchesText({ element, text: targetText }),
    );
  }

  if (
    observation.buttons.some((element) =>
      getDemoAgentObservedElementMatchesText({ element, text: targetText }),
    )
  ) {
    return true;
  }

  if (
    target.label &&
    observation.inputs.some((element) =>
      getDemoAgentObservedElementMatchesText({
        element,
        text: target.label,
      }),
    )
  ) {
    return true;
  }

  return observation.links.some((element) =>
    getDemoAgentObservedElementMatchesText({ element, text: targetText }),
  );
}
