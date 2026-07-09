import { mkdir, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { DemoWalkthroughGuide } from "../demoGuide/DemoWalkthroughGuide.js";
import type { ScannedAppContext } from "../project/ScannedAppContext.js";
import { convertVideoToMp4 } from "../recording/convertVideoToMp4.js";
import { createBrowserProfileDirectory } from "../recording/createBrowserProfileDirectory.js";
import { installBrowserInteractionCapture } from "../recording/installBrowserInteractionCapture.js";
import { openRecordingBrowserContext } from "../recording/openRecordingBrowserContext.js";
import { readBrowserInteractionEvents } from "../recording/readBrowserInteractionEvents.js";
import { waitForHttpUrl } from "../recording/waitForHttpUrl.js";
import { warnIfWebRecordingSizeUnexpected } from "../recording/warnIfWebRecordingSizeUnexpected.js";
import { logInfo } from "../terminal/logInfo.js";
import { logStep } from "../terminal/logStep.js";
import { assertDemoAgentUrlAllowed } from "./assertDemoAgentUrlAllowed.js";
import { createDemoAgentActionLogEntry } from "./createDemoAgentActionLogEntry.js";
import { createDemoAgentRunId } from "./createDemoAgentRunId.js";
import { createDemoAgentRunPaths } from "./createDemoAgentRunPaths.js";
import { createDemoAgentStartUrl } from "./createDemoAgentStartUrl.js";
import { demoAgentGuideCompleteStopReason } from "./demoAgentGuideCompleteStopReason.js";
import type { DemoAgentDriver } from "./DemoAgentDriver.js";
import type { DemoAgentOpenAiComputerOptions } from "./DemoAgentOpenAiComputerOptions.js";
import type { DemoAgentPlanner } from "./DemoAgentPlanner.js";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import type { DemoAgentRecordedRun } from "./DemoAgentRecordedRun.js";
import type { DemoAgentRunSummary } from "./DemoAgentRunSummary.js";
import { prepareDemoAgentRecordingAuth } from "./prepareDemoAgentRecordingAuth.js";
import { runDemoAgentDriverLoop } from "./runDemoAgentDriverLoop.js";
import { writeDemoAgentActionLogEntry } from "./writeDemoAgentActionLogEntry.js";
import { writeDemoAgentRunSummary } from "./writeDemoAgentRunSummary.js";

export async function runDemoAgentRecording(inputOptions: {
  allowBrowserInstallPrompt?: boolean;
  appContext?: ScannedAppContext;
  driver?: DemoAgentDriver;
  guide: DemoWalkthroughGuide;
  openAiComputer?: DemoAgentOpenAiComputerOptions;
  policy: DemoAgentPolicy;
  policyHash: string;
  planner?: DemoAgentPlanner;
  promptForSignIn?: boolean;
  startUrl: string;
}): Promise<DemoAgentRecordedRun> {
  const runId = createDemoAgentRunId();
  const runPaths = createDemoAgentRunPaths(runId);
  const userDataDir = await createBrowserProfileDirectory();
  const videoDirectory = await mkdtemp(join(tmpdir(), "clipstitchr-agent-video-"));
  let actionCount = 0;
  let screenshotCount = 0;
  let stepTimings: DemoAgentRunSummary["stepTimings"] = [];
  let stopReason = demoAgentGuideCompleteStopReason;
  let rawVideoPath = "";

  await mkdir(runPaths.screenshotsDirectory, { recursive: true });

  const startUrl = createDemoAgentStartUrl(
    inputOptions.startUrl,
    inputOptions.guide,
  );

  assertDemoAgentUrlAllowed(inputOptions.policy, startUrl);
  await waitForHttpUrl(startUrl);
  await prepareDemoAgentRecordingAuth({
    allowBrowserInstallPrompt: inputOptions.allowBrowserInstallPrompt,
    policy: inputOptions.policy,
    promptForSignIn: inputOptions.promptForSignIn,
    startUrl,
    userDataDir,
  });

  const startedAt = new Date().toISOString();
  const startedAtMs = Date.now();

  const context = await openRecordingBrowserContext({
    allowInstallPrompt: inputOptions.allowBrowserInstallPrompt,
    userDataDir,
    videoDirectory,
  });
  let interactionEvents: DemoAgentRecordedRun["interactionEvents"];
  let contextClosed = false;

  try {
    const page = await context.newPage();

    await installBrowserInteractionCapture(page);
    logStep("Opening the app with the guarded recording agent.");

    const initialUrlBefore = page.url();

    await page.goto(startUrl, { waitUntil: "domcontentloaded" });
    await page
      .waitForLoadState("networkidle", { timeout: 5000 })
      .catch(() => {});
    assertDemoAgentUrlAllowed(inputOptions.policy, page.url());
    actionCount += 1;

    await writeDemoAgentActionLogEntry(
      runPaths.actionLogPath,
      createDemoAgentActionLogEntry({
        action: "navigate",
        details: {
          policyDecision: "approved",
          url: startUrl,
          urlAfter: page.url(),
          urlBefore: initialUrlBefore,
        },
        result: "ok",
        url: page.url(),
      }),
    );

    const loopResult = await runDemoAgentDriverLoop({
      appContext: inputOptions.appContext,
      driver: inputOptions.driver ?? "structured-planner",
      guide: inputOptions.guide,
      initialActionCount: actionCount,
      initialScreenshotCount: screenshotCount,
      openAiComputer: inputOptions.openAiComputer,
      page,
      policy: inputOptions.policy,
      planner: inputOptions.planner,
      runId,
      runPaths,
      runStartedAt: startedAt,
      startedAtMs,
    });

    actionCount = loopResult.actionCount;
    screenshotCount = loopResult.screenshotCount;
    stepTimings = loopResult.stepTimings;
    stopReason = loopResult.stopReason;

    const stopUrlBefore = page.url();

    await writeDemoAgentActionLogEntry(
      runPaths.actionLogPath,
      createDemoAgentActionLogEntry({
        action: "stop",
        details: {
          policyDecision: "approved",
          urlAfter: stopUrlBefore,
          urlBefore: stopUrlBefore,
        },
        result: "stopped",
        stopReason,
        url: stopUrlBefore,
      }),
    );

    interactionEvents = await readBrowserInteractionEvents(page);
    const video = page.video();

    await context.close();
    contextClosed = true;

    rawVideoPath = (await video?.path()) ?? "";
  } catch (error) {
    stopReason = error instanceof Error ? error.message : "agent-error";
    throw error;
  } finally {
    if (!contextClosed) {
      await context.close().catch(() => {});
    }
  }

  if (!rawVideoPath) {
    throw new Error("No agent recording was saved.");
  }

  await convertVideoToMp4(rawVideoPath, runPaths.recordingPath);
  await warnIfWebRecordingSizeUnexpected(runPaths.recordingPath);

  const summary: DemoAgentRunSummary = {
    actionCount,
    allowedOrigins: inputOptions.policy.allowedOrigins,
    approvedForUpload: false,
    endedAt: new Date().toISOString(),
    guideId: inputOptions.guide.id,
    guideSource: inputOptions.guide.source,
    id: runId,
    mode: "guided-browser",
    policyHash: inputOptions.policyHash,
    recordingPath: runPaths.recordingPath,
    runDirectory: runPaths.runDirectory,
    screenshotCount,
    startUrl,
    startedAt,
    stepTimings,
    stopReason,
    uploaded: false,
  };

  await writeDemoAgentRunSummary(runPaths.runSummaryPath, summary);
  logInfo(`Saved agent recording evidence to ${runPaths.runDirectory}`);

  return {
    interactionEvents,
    rawVideoPath,
    runSummaryPath: runPaths.runSummaryPath,
    summary,
  };
}
