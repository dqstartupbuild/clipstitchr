import type { DemoWalkthroughGuide } from "../demoGuide/DemoWalkthroughGuide.js";
import type { DemoAgentTargetMode } from "../demoAgent/DemoAgentTargetMode.js";
import { getDemoAutoGuideStepIsBrowserNoise } from "./getDemoAutoGuideStepIsBrowserNoise.js";

export function sanitizeDemoAutoGuide(input: {
  guide: DemoWalkthroughGuide;
  targetMode: DemoAgentTargetMode;
}) {
  if (input.targetMode !== "live") {
    return input.guide;
  }

  const steps = input.guide.steps.filter(
    (step) => !getDemoAutoGuideStepIsBrowserNoise(step.label),
  );

  if (steps.length === input.guide.steps.length) {
    return input.guide;
  }

  if (steps.length > 0) {
    return { ...input.guide, steps };
  }

  return {
    ...input.guide,
    steps: [
      {
        id: "step-1",
        label: "Open the selected public page",
      },
      {
        id: "step-2",
        label: "Scroll through the main public sections",
      },
    ],
  };
}
