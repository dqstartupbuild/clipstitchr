import type { DemoWalkthroughStep } from "../demoGuide/DemoWalkthroughStep.js";

export function getDemoAgentStepIsScrollTour(step: DemoWalkthroughStep) {
  return /\b(scroll|tour|homepage|page|section|footer)\b/i.test(step.label);
}
