import type { CliDemoWalkthroughStep } from "@/lib/clipstitchr/server/cli/demoGuides/CliDemoWalkthroughStep";

export type CliDemoWalkthroughGuide = {
  appType: string;
  createdAt: string;
  flowName?: string;
  flowPath?: string;
  goal: string;
  id: string;
  productId: string;
  productName: string;
  source: "ai-assisted";
  steps: CliDemoWalkthroughStep[];
  title: string;
  updatedAt: string;
  version: 1;
};
