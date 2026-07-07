import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import type { DemoWalkthroughGuide } from "../demoGuide/DemoWalkthroughGuide.js";
import type { ScannedFlow } from "../project/ScannedFlow.js";
import { requestJson } from "./requestJson.js";

type GenerateDemoWalkthroughGuideInput = {
  appType: string;
  availableFlows?: ScannedFlow[];
  flowName?: string;
  flowPath?: string;
  goal: string;
  productId: string;
  stepCount: number;
  targetAudience: string;
};

export async function generateDemoWalkthroughGuide(
  credentials: ClipstitchrCredentials,
  input: GenerateDemoWalkthroughGuideInput,
) {
  return await requestJson<{
    guide: DemoWalkthroughGuide;
    providerModel: string;
    providerPredictionId?: string;
  }>(
    {
      accessToken: credentials.accessToken,
      apiBaseUrl: credentials.apiBaseUrl,
    },
    "/api/cli/demo-guides/generate",
    {
      body: JSON.stringify(input),
      method: "POST",
    },
  );
}
