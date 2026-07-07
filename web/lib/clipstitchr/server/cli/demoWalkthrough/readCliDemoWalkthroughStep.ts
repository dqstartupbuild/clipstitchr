import type { CliDemoWalkthroughStep } from "./CliDemoWalkthroughStep";
import { readCliDemoWalkthroughString } from "./readCliDemoWalkthroughString";

export function readCliDemoWalkthroughStep(
  value: unknown,
): CliDemoWalkthroughStep | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const rawStep = value as Record<string, unknown>;
  const id = readCliDemoWalkthroughString(rawStep.id, 80);
  const label = readCliDemoWalkthroughString(rawStep.label, 240);

  if (!id || !label) {
    return null;
  }

  return {
    id,
    label,
    notes: readCliDemoWalkthroughString(rawStep.notes, 500),
  };
}
