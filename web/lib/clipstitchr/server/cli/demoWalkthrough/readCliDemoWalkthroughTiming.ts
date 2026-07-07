import type { CliDemoWalkthroughTiming } from "./CliDemoWalkthroughTiming";
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

  if (
    !stepId ||
    !label ||
    typeof rawTiming.stepIndex !== "number" ||
    typeof rawTiming.startedAtMs !== "number" ||
    typeof rawTiming.completedAtMs !== "number" ||
    typeof rawTiming.durationMs !== "number"
  ) {
    return null;
  }

  return {
    completedAtMs: Math.max(0, Math.round(rawTiming.completedAtMs)),
    durationMs: Math.max(0, Math.round(rawTiming.durationMs)),
    label,
    startedAtMs: Math.max(0, Math.round(rawTiming.startedAtMs)),
    stepId,
    stepIndex: Math.max(0, Math.round(rawTiming.stepIndex)),
  };
}
