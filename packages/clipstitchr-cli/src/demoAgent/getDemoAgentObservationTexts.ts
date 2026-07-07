import type { DemoAgentObservedElement } from "./DemoAgentObservedElement.js";
import type { DemoAgentPageObservation } from "./DemoAgentPageObservation.js";

function readElementTexts(element: DemoAgentObservedElement) {
  return [element.label, element.name];
}

export function getDemoAgentObservationTexts(
  observation: DemoAgentPageObservation,
) {
  return [
    observation.title,
    ...observation.headings.flatMap(readElementTexts),
    ...observation.buttons.flatMap(readElementTexts),
    ...observation.links.flatMap(readElementTexts),
    ...observation.inputs.flatMap(readElementTexts),
    ...observation.dialogs.flatMap(readElementTexts),
  ];
}
