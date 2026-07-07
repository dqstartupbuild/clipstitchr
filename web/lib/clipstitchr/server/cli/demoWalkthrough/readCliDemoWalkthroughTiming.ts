import type { CliDemoWalkthroughTiming } from "./CliDemoWalkthroughTiming";
import { readCliDemoWalkthroughNonnegativeNumber } from "./readCliDemoWalkthroughNonnegativeNumber";
import { readCliDemoWalkthroughString } from "./readCliDemoWalkthroughString";

export function readCliDemoWalkthroughTiming(
  value: unknown,
): CliDemoWalkthroughTiming | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const rawTiming = value as Record<string, unknown>;
  const stepId = readCliDemoWalkthroughString(rawTiming.stepId, 80);
  const label = readCliDemoWalkthroughString(rawTiming.label, 240);
  const stepIndex = readCliDemoWalkthroughNonnegativeNumber(rawTiming.stepIndex);
  const startedAtMs = readCliDemoWalkthroughNonnegativeNumber(
    rawTiming.startedAtMs,
  );
  const completedAtMs = readCliDemoWalkthroughNonnegativeNumber(
    rawTiming.completedAtMs,
  );
  const durationMs = readCliDemoWalkthroughNonnegativeNumber(rawTiming.durationMs);

  if (
    !stepId ||
    !label ||
    stepIndex === null ||
    startedAtMs === null ||
    completedAtMs === null ||
    durationMs === null
  ) {
    return null;
  }

  return {
    completedAtMs,
    durationMs,
    label,
    startedAtMs,
    stepId,
    stepIndex,
  };
}
