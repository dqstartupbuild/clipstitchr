import { mkdir } from "node:fs/promises";
import { input } from "@inquirer/prompts";
import type { DemoWalkthroughGuide } from "../demoGuide/DemoWalkthroughGuide.js";
import type { ScannedAppContext } from "../project/ScannedAppContext.js";
import { createBrowserProfileDirectory } from "../recording/createBrowserProfileDirectory.js";
import { waitForHttpUrl } from "../recording/waitForHttpUrl.js";
import { logInfo } from "../terminal/logInfo.js";
import { logStep } from "../terminal/logStep.js";
import { assertDemoAgentUrlAllowed } from "./assertDemoAgentUrlAllowed.js";
import { createDemoAgentActionLogEntry } from "./createDemoAgentActionLogEntry.js";
import { createDemoAgentRunId } from "./createDemoAgentRunId.js";
import { createDemoAgentRunPaths } from "./createDemoAgentRunPaths.js";
import { createDemoAgentStartUrl } from "./createDemoAgentStartUrl.js";
import { demoAgentGuideCompleteStopReason } from "./demoAgentGuideCompleteStopReason.js";
import type { DemoAgentPlanner } from "./DemoAgentPlanner.js";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import type { DemoAgentRunSummary } from "./DemoAgentRunSummary.js";
import { openDemoAgentBrowserContext } from "./openDemoAgentBrowserContext.js";
import { runDemoAgentLoop } from "./runDemoAgentLoop.js";
import { writeDemoAgentActionLogEntry } from "./writeDemoAgentActionLogEntry.js";
import { writeDemoAgentRunSummary } from "./writeDemoAgentRunSummary.js";

export async function runDemoAgentDryRun(inputOptions: {
  appContext?: ScannedAppContext;
  guide: DemoWalkthroughGuide;
  policy: DemoAgentPolicy;
  policyHash: string;
  planner?: DemoAgentPlanner;
  startUrl: string;
}) {
  const runId = createDemoAgentRunId();
  const runPaths = createDemoAgentRunPaths(runId);
  const userDataDir = await createBrowserProfileDirectory();
  const startedAt = new Date().toISOString();
  const startedAtMs = Date.now();
  let actionCount = 0;
  let screenshotCount = 0;
  let stepTimings: DemoAgentRunSummary["stepTimings"] = [];
  let stopReason = demoAgentGuideCompleteStopReason;

  await mkdir(runPaths.screenshotsDirectory, { recursive: true });

  const startUrl = createDemoAgentStartUrl(
    inputOptions.startUrl,
    inputOptions.guide,
  );

  assertDemoAgentUrlAllowed(inputOptions.policy, startUrl);
  await waitForHttpUrl(startUrl);

  const context = await openDemoAgentBrowserContext(userDataDir);

  try {
    const page = await context.newPage();

    logStep("Opening the local app with the guarded agent.");
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

    await input({
      message:
        "Sign in with a test account if needed, then press Enter to run the safe dry-run.",
    });

    const loopResult = await runDemoAgentLoop({
      appContext: inputOptions.appContext,
      guide: inputOptions.guide,
      initialActionCount: actionCount,
      initialScreenshotCount: screenshotCount,
      page,
      policy: inputOptions.policy,
      planner: inputOptions.planner,
      runPaths,
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
  } catch (error) {
    stopReason = error instanceof Error ? error.message : "agent-error";
    throw error;
  } finally {
    await context.close();
  }

  const summary: DemoAgentRunSummary = {
    actionCount,
    allowedOrigins: inputOptions.policy.allowedOrigins,
    approvedForUpload: false,
    endedAt: new Date().toISOString(),
    guideId: inputOptions.guide.id,
    guideSource: inputOptions.guide.source,
    id: runId,
    mode: "guided-browser" as const,
    policyHash: inputOptions.policyHash,
    runDirectory: runPaths.runDirectory,
    screenshotCount,
    startUrl,
    startedAt,
    stepTimings,
    stopReason,
    uploaded: false,
  };

  await writeDemoAgentRunSummary(runPaths.runSummaryPath, summary);
  logInfo(`Saved dry-run evidence to ${runPaths.runDirectory}`);

  return summary;
}
