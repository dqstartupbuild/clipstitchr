import type { ProductSummary } from "../api/ProductSummary.js";
import type { DetectedProject } from "../project/DetectedProject.js";
import type { ScannedFlow } from "../project/ScannedFlow.js";
import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";
import { createDemoWalkthroughGuideId } from "./createDemoWalkthroughGuideId.js";
import { createDemoWalkthroughGuideSteps } from "./createDemoWalkthroughGuideSteps.js";
import { demoWalkthroughGuideVersion } from "./demoWalkthroughGuideVersion.js";

export function createDemoWalkthroughGuide(input: {
  flow?: ScannedFlow;
  goal: string;
  product: ProductSummary;
  project: Pick<DetectedProject, "type">;
}): DemoWalkthroughGuide {
  const createdAt = new Date().toISOString();
  const goal = input.goal.trim();

  return {
    appType: input.project.type,
    createdAt,
    flowName: input.flow?.name,
    flowPath: input.flow?.path,
    goal,
    id: createDemoWalkthroughGuideId(),
    productId: input.product.id,
    productName: input.product.name,
    source: "cli-template",
    steps: createDemoWalkthroughGuideSteps({
      flowName: input.flow?.name,
      goal,
    }),
    title: `${input.product.name} walkthrough`,
    updatedAt: createdAt,
    version: demoWalkthroughGuideVersion,
  };
}
