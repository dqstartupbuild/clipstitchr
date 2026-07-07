import type { DemoWalkthroughGuide } from "../../src/demoGuide/DemoWalkthroughGuide.js";
import type { DemoWalkthroughStep } from "../../src/demoGuide/DemoWalkthroughStep.js";

export function createDemoAgentTestGuide(
  steps: DemoWalkthroughStep[],
): DemoWalkthroughGuide {
  const timestamp = new Date("2026-01-01T00:00:00.000Z").toISOString();

  return {
    appType: "web",
    createdAt: timestamp,
    flowName: "Fixture flow",
    flowPath: "/dashboard",
    goal: "Verify the guarded agent loop",
    id: "guide_fixture",
    source: "cli-template",
    steps,
    title: "Fixture guide",
    updatedAt: timestamp,
    version: 1,
  };
}
