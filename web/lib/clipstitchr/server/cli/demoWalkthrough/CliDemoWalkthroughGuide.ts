import type { CliDemoWalkthroughStep } from "./CliDemoWalkthroughStep";

export type CliDemoWalkthroughGuide = {
  appType?: string;
  createdAt?: string;
  flowName?: string;
  flowPath?: string;
  goal: string;
  id: string;
  productId?: string;
  productName?: string;
  source?: string;
  steps: CliDemoWalkthroughStep[];
  title: string;
  updatedAt?: string;
  version?: number;
};
