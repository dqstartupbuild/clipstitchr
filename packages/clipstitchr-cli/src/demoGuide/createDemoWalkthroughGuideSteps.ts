import type { DemoWalkthroughStep } from "./DemoWalkthroughStep.js";
import { createDemoWalkthroughStepId } from "./createDemoWalkthroughStepId.js";

export function createDemoWalkthroughGuideSteps(input: {
  flowName?: string;
  goal: string;
}): DemoWalkthroughStep[] {
  const hint = `${input.goal} ${input.flowName ?? ""}`.toLowerCase();

  if (
    hint.includes("upload") ||
    hint.includes("import") ||
    hint.includes("media") ||
    hint.includes("video") ||
    hint.includes("clip")
  ) {
    return [
      "Open the dashboard",
      "Show the upload button",
      "Upload or choose a sample clip",
      "Show the finished Demo in the library",
      "End on the result",
    ].map((label, index) => ({
      id: createDemoWalkthroughStepId(index),
      label,
    }));
  }

  if (
    hint.includes("onboarding") ||
    hint.includes("setup") ||
    hint.includes("sign up") ||
    hint.includes("connect")
  ) {
    return [
      "Open the first screen",
      "Show the setup step",
      "Complete the main action",
      "Show the ready state",
      "End on what changed",
    ].map((label, index) => ({
      id: createDemoWalkthroughStepId(index),
      label,
    }));
  }

  if (
    hint.includes("dashboard") ||
    hint.includes("workspace") ||
    hint.includes("library") ||
    hint.includes("analytics")
  ) {
    return [
      "Open the dashboard",
      "Point out the main workspace",
      "Show the key action",
      "Show the result in context",
      "End on the strongest proof",
    ].map((label, index) => ({
      id: createDemoWalkthroughStepId(index),
      label,
    }));
  }

  return [
    "Open the product",
    "Show the starting point",
    "Walk through the main action",
    "Show the result",
    "End on the final outcome",
  ].map((label, index) => ({
    id: createDemoWalkthroughStepId(index),
    label,
  }));
}
