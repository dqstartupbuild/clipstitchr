import type { DemoWalkthroughStep } from "./DemoWalkthroughStep.js";
import type { DemoWalkthroughGuideSource } from "./DemoWalkthroughGuideSource.js";

export type DemoWalkthroughGuide = {
  appType?: string;
  createdAt: string;
  flowName?: string;
  flowPath?: string;
  goal: string;
  id: string;
  productId?: string;
  productName?: string;
  source: DemoWalkthroughGuideSource;
  steps: DemoWalkthroughStep[];
  title: string;
  updatedAt: string;
  version: 1;
};
