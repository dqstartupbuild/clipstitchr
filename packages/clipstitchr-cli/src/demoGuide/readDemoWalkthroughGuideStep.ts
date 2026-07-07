import type { DemoWalkthroughStep } from "./DemoWalkthroughStep.js";
import { readDemoWalkthroughGuideString } from "./readDemoWalkthroughGuideString.js";

export function readDemoWalkthroughGuideStep(
  value: unknown,
): DemoWalkthroughStep | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const rawStep = value as Record<string, unknown>;
  const id = readDemoWalkthroughGuideString(rawStep.id);
  const label = readDemoWalkthroughGuideString(rawStep.label);

  if (!id || !label) {
    return null;
  }

  return {
    id,
    label,
    notes: readDemoWalkthroughGuideString(rawStep.notes),
  };
}
