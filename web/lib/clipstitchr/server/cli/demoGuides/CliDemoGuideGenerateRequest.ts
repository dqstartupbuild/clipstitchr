import type { CliDemoGuideFlowContext } from "@/lib/clipstitchr/server/cli/demoGuides/CliDemoGuideFlowContext";

export type CliDemoGuideGenerateRequest = {
  appType: string;
  availableFlows: CliDemoGuideFlowContext[];
  flowName?: string;
  flowPath?: string;
  goal: string;
  productId: string;
  stepCount: number;
  targetAudience: string;
};
