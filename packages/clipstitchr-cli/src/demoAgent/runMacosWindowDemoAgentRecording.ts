import { mkdir } from "node:fs/promises";
import type { DemoWalkthroughGuide } from "../demoGuide/DemoWalkthroughGuide.js";
import type { MacosWindowInfo } from "../native/macosWindowHelper/MacosWindowInfo.js";
import { MacosWindowHelperClient } from "../native/macosWindowHelper/MacosWindowHelperClient.js";
import { assertMacosWindowHelperPermissions } from "../native/macosWindowHelper/assertMacosWindowHelperPermissions.js";
import { createMacosWindowOpenAiComputerSurfaceAdapter } from "../native/macosWindowHelper/createMacosWindowOpenAiComputerSurfaceAdapter.js";
import { ensureMacosWindowHelperInstalled } from "../native/macosWindowHelper/ensureMacosWindowHelperInstalled.js";
import { selectMacosWindow } from "../native/macosWindowHelper/selectMacosWindow.js";
import type { ScannedAppContext } from "../project/ScannedAppContext.js";
import { logInfo } from "../terminal/logInfo.js";
import { logStep } from "../terminal/logStep.js";
import { createDemoAgentActionLogEntry } from "./createDemoAgentActionLogEntry.js";
import { createDemoAgentRunId } from "./createDemoAgentRunId.js";
import { createDemoAgentRunPaths } from "./createDemoAgentRunPaths.js";
import { createOpenAiComputerRelayRequester } from "./createOpenAiComputerRelayRequester.js";
import { demoAgentGuideCompleteStopReason } from "./demoAgentGuideCompleteStopReason.js";
import type { DemoAgentOpenAiComputerOptions } from "./DemoAgentOpenAiComputerOptions.js";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import type { DemoAgentRecordedRun } from "./DemoAgentRecordedRun.js";
import type { DemoAgentRunSummary } from "./DemoAgentRunSummary.js";
import { runOpenAiComputerSurfaceDemoAgentLoop } from "./runOpenAiComputerSurfaceDemoAgentLoop.js";
import { writeDemoAgentActionLogEntry } from "./writeDemoAgentActionLogEntry.js";
import { writeDemoAgentRunSummary } from "./writeDemoAgentRunSummary.js";

export async function runMacosWindowDemoAgentRecording(input: {
  appContext?: ScannedAppContext;
  guide: DemoWalkthroughGuide;
  onWindowSelected?: (
    window: MacosWindowInfo & { preferredMatch?: string },
  ) => Promise<void>;
  openAiComputer: DemoAgentOpenAiComputerOptions;
  policy: DemoAgentPolicy;
  policyHash: string;
  preferredWindowMatch?: string;
}): Promise<DemoAgentRecordedRun> {
  if (process.platform !== "darwin") {
    throw new Error("macOS window control is only available on macOS.");
  }

  const runId = createDemoAgentRunId();
  const runPaths = createDemoAgentRunPaths(runId);
  const startedAt = new Date().toISOString();
  const startedAtMs = Date.now();
  const helper = new MacosWindowHelperClient();
  let actionCount = 0;
  let screenshotCount = 0;
  let stepTimings: DemoAgentRunSummary["stepTimings"] = [];
  let stopReason = demoAgentGuideCompleteStopReason;

  await mkdir(runPaths.screenshotsDirectory, { recursive: true });
  logStep("Preparing the macOS window helper.");
  await ensureMacosWindowHelperInstalled();
  await helper.start();

  try {
    assertMacosWindowHelperPermissions(await helper.checkPermissions(false));

    const window = await selectMacosWindow({
      helper,
      preferredMatch: input.preferredWindowMatch,
    });

    await input.onWindowSelected?.(window);

    logStep("Recording the selected window with the guarded AI agent.");

    const requester =
      input.openAiComputer.requester ??
      (input.openAiComputer.mode === "relay" && input.openAiComputer.credentials
        ? createOpenAiComputerRelayRequester({
            credentials: input.openAiComputer.credentials,
            runId,
            runStartedAt: startedAt,
          })
        : undefined);

    const loopResult = await runOpenAiComputerSurfaceDemoAgentLoop({
      apiKey: input.openAiComputer.apiKey,
      appContext: input.appContext,
      guide: input.guide,
      model: input.openAiComputer.model,
      policy: input.policy,
      requester,
      runPaths,
      startedAtMs,
      surface: createMacosWindowOpenAiComputerSurfaceAdapter({
        helper,
        window,
      }),
    });

    actionCount = loopResult.actionCount;
    screenshotCount = loopResult.screenshotCount;
    stepTimings = loopResult.stepTimings;
    stopReason = loopResult.stopReason;

    await writeDemoAgentActionLogEntry(
      runPaths.actionLogPath,
      createDemoAgentActionLogEntry({
        action: "stop",
        details: {
          policyDecision: "approved",
          urlAfter: "macos-window://local",
          urlBefore: "macos-window://local",
        },
        result: "stopped",
        stopReason,
        url: "macos-window://local",
      }),
    );
  } finally {
    await helper.stop();
  }

  const summary: DemoAgentRunSummary = {
    actionCount,
    allowedOrigins: input.policy.allowedOrigins,
    approvedForUpload: false,
    endedAt: new Date().toISOString(),
    guideId: input.guide.id,
    guideSource: input.guide.source,
    id: runId,
    mode: "guided-macos-window",
    policyHash: input.policyHash,
    runDirectory: runPaths.runDirectory,
    screenshotCount,
    startUrl: "macos-window://local",
    startedAt,
    stepTimings,
    stopReason,
    uploaded: false,
  };

  await writeDemoAgentRunSummary(runPaths.runSummaryPath, summary);
  logInfo(`Saved macOS window evidence to ${runPaths.runDirectory}`);

  return {
    rawVideoPath: "",
    runSummaryPath: runPaths.runSummaryPath,
    summary,
  };
}
