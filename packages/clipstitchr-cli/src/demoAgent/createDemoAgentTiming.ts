import type { DemoWalkthroughTiming } from "../demoGuide/DemoWalkthroughTiming.js";
import type { DemoWalkthroughStep } from "../demoGuide/DemoWalkthroughStep.js";

export function createDemoAgentTiming(input: {
  completedAtMs: number;
  startedAtMs: number;
  step: DemoWalkthroughStep;
  stepIndex: number;
}): DemoWalkthroughTiming {
  return {
    completedAtMs: Math.round(input.completedAtMs),
    durationMs: Math.max(
      0,
      Math.round(input.completedAtMs - input.startedAtMs),
    ),
    label: input.step.label,
    startedAtMs: Math.round(input.startedAtMs),
    stepId: input.step.id,
    stepIndex: input.stepIndex,
  };
}
