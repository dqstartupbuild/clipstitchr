import type { CliDemoAppContext } from "@/lib/clipstitchr/server/cli/appContext/CliDemoAppContext";
import type { CliDemoGuideFlowContext } from "@/lib/clipstitchr/server/cli/demoGuides/CliDemoGuideFlowContext";

export type CliDemoGuideGenerateRequest = {
  appContext?: CliDemoAppContext;
  appType: string;
  availableFlows: CliDemoGuideFlowContext[];
  flowName?: string;
  flowPath?: string;
  goal: string;
  productId: string;
  stepCount: number;
  targetAudience: string;
};
