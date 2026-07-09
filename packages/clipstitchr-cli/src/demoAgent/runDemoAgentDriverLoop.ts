import type { Page } from "playwright";
import type { DemoWalkthroughGuide } from "../demoGuide/DemoWalkthroughGuide.js";
import type { ScannedAppContext } from "../project/ScannedAppContext.js";
import type { DemoAgentDriver } from "./DemoAgentDriver.js";
import type { DemoAgentLoopResult } from "./DemoAgentLoopResult.js";
import type { DemoAgentOpenAiComputerOptions } from "./DemoAgentOpenAiComputerOptions.js";
import type { DemoAgentPlanner } from "./DemoAgentPlanner.js";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import type { DemoAgentRunPaths } from "./DemoAgentRunPaths.js";
import { runDemoAgentLoop } from "./runDemoAgentLoop.js";
import { runOpenAiComputerDemoAgentLoop } from "./runOpenAiComputerDemoAgentLoop.js";

export async function runDemoAgentDriverLoop(input: {
  appContext?: ScannedAppContext;
  driver: DemoAgentDriver;
  guide: DemoWalkthroughGuide;
  initialActionCount?: number;
  initialScreenshotCount?: number;
  openAiComputer?: DemoAgentOpenAiComputerOptions;
  page: Page;
  planner?: DemoAgentPlanner;
  policy: DemoAgentPolicy;
  runPaths: Pick<DemoAgentRunPaths, "actionLogPath" | "screenshotsDirectory">;
  startedAtMs: number;
}): Promise<DemoAgentLoopResult> {
  if (input.driver === "openai-computer") {
    if (!input.openAiComputer) {
      throw new Error("OPENAI_API_KEY is required for --driver openai-computer.");
    }

    return await runOpenAiComputerDemoAgentLoop({
      apiKey: input.openAiComputer.apiKey,
      appContext: input.appContext,
      guide: input.guide,
      initialActionCount: input.initialActionCount,
      initialScreenshotCount: input.initialScreenshotCount,
      model: input.openAiComputer.model,
      page: input.page,
      policy: input.policy,
      requester: input.openAiComputer.requester,
      runPaths: input.runPaths,
      startedAtMs: input.startedAtMs,
    });
  }

  return await runDemoAgentLoop({
    appContext: input.appContext,
    guide: input.guide,
    initialActionCount: input.initialActionCount,
    initialScreenshotCount: input.initialScreenshotCount,
    page: input.page,
    planner: input.planner,
    policy: input.policy,
    runPaths: input.runPaths,
    startedAtMs: input.startedAtMs,
  });
}
