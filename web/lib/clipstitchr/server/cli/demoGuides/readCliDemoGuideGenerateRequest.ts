import type { CliDemoGuideGenerateRequest } from "@/lib/clipstitchr/server/cli/demoGuides/CliDemoGuideGenerateRequest";
import {
  cliDemoGuideMaxStepCount,
  cliDemoGuideMinStepCount,
} from "@/lib/clipstitchr/server/cli/demoGuides/cliDemoGuideStepCountBounds";
import { readCliDemoAppContext } from "@/lib/clipstitchr/server/cli/appContext/readCliDemoAppContext";
import { readCliDemoGuideFlowContexts } from "@/lib/clipstitchr/server/cli/demoGuides/readCliDemoGuideFlowContexts";
import { readCliRequiredString } from "@/lib/clipstitchr/server/cli/readCliRequiredString";

export function readCliDemoGuideGenerateRequest(
  body: Record<string, unknown>,
): CliDemoGuideGenerateRequest {
  const rawStepCount =
    typeof body.stepCount === "number" ? Math.round(body.stepCount) : 5;
  const stepCount = Math.min(
    cliDemoGuideMaxStepCount,
    Math.max(cliDemoGuideMinStepCount, rawStepCount),
  );
  const targetAudience =
    typeof body.targetAudience === "string" && body.targetAudience.trim()
      ? body.targetAudience.trim()
      : "people evaluating this product";
  const flowName =
    typeof body.flowName === "string" && body.flowName.trim()
      ? body.flowName.trim().slice(0, 120)
      : undefined;
  const flowPath =
    typeof body.flowPath === "string" && body.flowPath.trim()
      ? body.flowPath.trim().slice(0, 200)
      : undefined;

  return {
    appContext: readCliDemoAppContext(body.appContext),
    appType: readCliRequiredString(body, "appType", "app type").slice(0, 40),
    availableFlows: readCliDemoGuideFlowContexts(body.availableFlows),
    flowName,
    flowPath,
    goal: readCliRequiredString(body, "goal", "demo goal").slice(0, 300),
    productId: readCliRequiredString(body, "productId", "product ID"),
    stepCount,
    targetAudience: targetAudience.slice(0, 240),
  };
}
