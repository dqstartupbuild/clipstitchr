import type { DemoWalkthroughStep } from "./DemoWalkthroughStep.js";

export type DemoWalkthroughGuide = {
  appType?: string;
  createdAt: string;
  flowName?: string;
  flowPath?: string;
  goal: string;
  id: string;
  productId?: string;
  productName?: string;
  source: "cli-template";
  steps: DemoWalkthroughStep[];
  title: string;
  updatedAt: string;
  version: 1;
};
