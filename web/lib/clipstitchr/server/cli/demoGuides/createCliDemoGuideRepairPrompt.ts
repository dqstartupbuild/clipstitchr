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
        "Repair this demo guide response. Return only valid JSON with title, goal, and step labels.",
      errorMessage,
      requiredStepCount: request.stepCount,
      originalOutput: outputText.slice(0, 4000),
    },
    null,
    2,
  );
}
