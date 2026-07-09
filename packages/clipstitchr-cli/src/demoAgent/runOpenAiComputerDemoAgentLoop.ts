import type { Page } from "playwright";
import type { DemoWalkthroughGuide } from "../demoGuide/DemoWalkthroughGuide.js";
import type { ScannedAppContext } from "../project/ScannedAppContext.js";
import { createPlaywrightOpenAiComputerSurfaceAdapter } from "./createPlaywrightOpenAiComputerSurfaceAdapter.js";
import type { DemoAgentLoopResult } from "./DemoAgentLoopResult.js";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import type { DemoAgentRunPaths } from "./DemoAgentRunPaths.js";
import type { OpenAiComputerRequester } from "./OpenAiComputerRequester.js";
import { runOpenAiComputerSurfaceDemoAgentLoop } from "./runOpenAiComputerSurfaceDemoAgentLoop.js";

export async function runOpenAiComputerDemoAgentLoop(input: {
  apiKey?: string;
  appContext?: ScannedAppContext;
  guide: DemoWalkthroughGuide;
  initialActionCount?: number;
  initialScreenshotCount?: number;
  model: string;
  page: Page;
  policy: DemoAgentPolicy;
  requester?: OpenAiComputerRequester;
  runPaths: Pick<DemoAgentRunPaths, "actionLogPath" | "screenshotsDirectory">;
  startedAtMs: number;
}): Promise<DemoAgentLoopResult> {
  return await runOpenAiComputerSurfaceDemoAgentLoop({
    apiKey: input.apiKey,
    appContext: input.appContext,
    guide: input.guide,
    initialActionCount: input.initialActionCount,
    initialScreenshotCount: input.initialScreenshotCount,
    model: input.model,
    policy: input.policy,
    requester: input.requester,
    runPaths: input.runPaths,
    startedAtMs: input.startedAtMs,
    surface: createPlaywrightOpenAiComputerSurfaceAdapter(input.page),
  });
}
