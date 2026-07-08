import type { DemoAgentObservedElement } from "./DemoAgentObservedElement.js";
import { normalizeDemoAgentMatchText } from "./normalizeDemoAgentMatchText.js";

export function getDemoAgentObservedElementMatchesText({
  allowPartial = false,
  element,
  text,
}: {
  allowPartial?: boolean;
  element: DemoAgentObservedElement;
  text?: string;
}) {
  const normalizedText = normalizeDemoAgentMatchText(text ?? "");

  if (!normalizedText) {
    return false;
  }

  const normalizedElementTexts = [element.name, element.label]
    .map((value) => normalizeDemoAgentMatchText(value ?? ""))
    .filter(Boolean);

  return normalizedElementTexts.some((elementText) => {
    if (elementText === normalizedText) {
      return true;
    }

    return (
      allowPartial &&
      (elementText.includes(normalizedText) ||
        normalizedText.includes(elementText))
    );
  });
}
