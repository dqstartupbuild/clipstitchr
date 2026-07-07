import { basename } from "node:path";
import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import type { DemoWalkthroughGuide } from "../demoGuide/DemoWalkthroughGuide.js";
import type { DemoWalkthroughStep } from "../demoGuide/DemoWalkthroughStep.js";
import type { DemoAgentAction } from "../demoAgent/DemoAgentAction.js";
import type { DemoAgentPageObservation } from "../demoAgent/DemoAgentPageObservation.js";
import type { DemoAgentPolicy } from "../demoAgent/DemoAgentPolicy.js";
import type { DemoAgentStepState } from "../demoAgent/DemoAgentStepState.js";
import { parseDemoAgentPlannerAction } from "../demoAgent/parseDemoAgentPlannerAction.js";
import { requestJson } from "./requestJson.js";

type PlanDemoAgentActionResponse = {
  action: unknown;
  providerModel: string;
  providerPredictionId?: string;
};

export async function planDemoAgentActionWithAi(
  credentials: ClipstitchrCredentials,
  input: {
    guide: DemoWalkthroughGuide;
    observation: DemoAgentPageObservation;
    policy: DemoAgentPolicy;
    step: DemoWalkthroughStep;
    stepState: DemoAgentStepState;
  },
): Promise<DemoAgentAction> {
  const response = await requestJson<PlanDemoAgentActionResponse>(
    {
      accessToken: credentials.accessToken,
      apiBaseUrl: credentials.apiBaseUrl,
    },
    "/api/cli/demo-agent/plan",
    {
      body: JSON.stringify({
        approvedTestValueKeys: Object.keys(input.policy.approvedTestValues),
        approvedUploadFileKeys: input.policy.approvedUploadFiles.map((filePath) =>
          basename(filePath),
        ),
        attemptedActionKeys: Array.from(input.stepState.attemptedActionKeys),
        guide: {
          goal: input.guide.goal,
          steps: input.guide.steps.map((step) => ({
            id: step.id,
            label: step.label,
            notes: step.notes,
          })),
          title: input.guide.title,
        },
        observation: input.observation,
        step: input.step,
      }),
      method: "POST",
    },
  );

  return parseDemoAgentPlannerAction(JSON.stringify(response.action));
}
