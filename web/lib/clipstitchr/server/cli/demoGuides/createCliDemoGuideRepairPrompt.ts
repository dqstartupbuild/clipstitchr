import type { CliDemoGuideGenerateRequest } from "@/lib/clipstitchr/server/cli/demoGuides/CliDemoGuideGenerateRequest";

export function createCliDemoGuideRepairPrompt({
  errorMessage,
  outputText,
  request,
}: {
  errorMessage: string;
  outputText: string;
  request: CliDemoGuideGenerateRequest;
}) {
  return JSON.stringify(
    {
      task:
        "Repair this demo guide response. Return only valid JSON with title, goal, and browser-action step labels.",
      errorMessage,
      agentRules: {
        allowed:
          "Use concrete actions such as Open, Click, Choose, Select, Upload, Wait for, Review, or Use.",
        banned:
          "Do not use Point out, Highlight, Explain, Describe, Mention, Talk through, Show where, Show how, create a new project, or export preset steps unless the supplied route context proves those controls exist.",
        knownRoutes: request.availableFlows,
      },
      requiredStepCount: request.stepCount,
      originalOutput: outputText.slice(0, 4000),
    },
    null,
    2,
  );
}
