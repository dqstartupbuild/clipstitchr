import { input } from "@inquirer/prompts";
import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";
import type { DemoWalkthroughTiming } from "./DemoWalkthroughTiming.js";

export async function runDemoWalkthroughStepper(
  guide: DemoWalkthroughGuide,
): Promise<DemoWalkthroughTiming[]> {
  const timings: DemoWalkthroughTiming[] = [];
  const startedAt = Date.now();

  for (const [index, step] of guide.steps.entries()) {
    const stepStartedAt = Date.now();

    await input({
      message: `Step ${index + 1} of ${guide.steps.length}: ${step.label}. Press Enter when this step is done.`,
    });

    const completedAt = Date.now();

    timings.push({
      completedAtMs: completedAt - startedAt,
      durationMs: completedAt - stepStartedAt,
      label: step.label,
      startedAtMs: stepStartedAt - startedAt,
      stepId: step.id,
      stepIndex: index,
    });
  }

  return timings;
}
