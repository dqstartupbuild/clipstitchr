import type { ChildProcess } from "node:child_process";
import { confirm } from "@inquirer/prompts";
import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { ensureCredentialsOrLogin } from "./ensureCredentialsOrLogin.js";
import { planDemoAgentActionWithAi } from "../api/planDemoAgentActionWithAi.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { resolveApiBaseUrl } from "../config/resolveApiBaseUrl.js";
import { createDemoAgentPlannerWithFallback } from "../demoAgent/createDemoAgentPlannerWithFallback.js";
import { readDemoAgentPolicy } from "../demoAgent/readDemoAgentPolicy.js";
import { runDemoAgentDryRun } from "../demoAgent/runDemoAgentDryRun.js";
import { runDemoAgentRecording } from "../demoAgent/runDemoAgentRecording.js";
import { resolveDemoWalkthroughGuide } from "../demoGuide/resolveDemoWalkthroughGuide.js";
import { selectProduct } from "../interactive/selectProduct.js";
import { detectProject } from "../project/detectProject.js";
import { findRunningLocalAppUrl } from "../project/findRunningLocalAppUrl.js";
import { isHttpUrlReachable } from "../project/isHttpUrlReachable.js";
import { runShellCommand } from "../recording/runShellCommand.js";
import { stopShellCommand } from "../recording/stopShellCommand.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logInfo } from "../terminal/logInfo.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logNextCommand } from "../terminal/logNextCommand.js";
import { logStep } from "../terminal/logStep.js";
import { logSuccess } from "../terminal/logSuccess.js";
import { logWarning } from "../terminal/logWarning.js";
import { uploadDemoFile } from "../upload/uploadDemoFile.js";
import { reviewDemoAgentRecordingUpload } from "./reviewDemoAgentRecordingUpload.js";
import { writeDemoAgentRunSummary } from "../demoAgent/writeDemoAgentRunSummary.js";

type DemoAgentRunOptions = CliGlobalOptions & {
  aiPlanner?: boolean;
  dryRun?: boolean;
  guide?: string;
  product?: string;
  start?: string;
  upload?: boolean;
  url?: string;
};

export async function runDemoAgentRunCommand(options: DemoAgentRunOptions) {
  logBrandHeader("Run the local demo agent");

  if (!options.guide) {
    throw new Error("Choose a walkthrough guide with --guide.");
  }

  const config = await readProjectConfig();
  const apiBaseUrl = resolveApiBaseUrl(config, options.api);
  const project = await detectProject();

  if (!["expo", "web"].includes(project.type)) {
    throw new Error("The local demo agent only supports web and Expo web apps.");
  }

  const guide = await resolveDemoWalkthroughGuide(options.guide);

  if (!guide) {
    throw new Error(`No walkthrough guide found for ${options.guide}.`);
  }

  const { hash, policy } = await readDemoAgentPolicy();
  const runningUrl = await findRunningLocalAppUrl(
    options.url ?? config.target?.url,
  );
  const url = options.url ?? runningUrl ?? config.target?.url;

  if (!url) {
    throw new Error("Set a local URL with --url or run `clipstitchr link` first.");
  }

  const startCommand = options.start ?? config.target?.start;
  let appProcess: ChildProcess | null = null;
  const plannerCredentials = options.aiPlanner
    ? await ensureCredentialsOrLogin(apiBaseUrl)
    : undefined;
  const planner = plannerCredentials
    ? createDemoAgentPlannerWithFallback({
        aiPlanner: (plannerInput) =>
          planDemoAgentActionWithAi(plannerCredentials, plannerInput),
        onFallback: (error) => {
          logWarning(
            "AI planner failed. Using the local planner for the rest of this run.",
          );
          logInfo(
            error instanceof Error ? error.message : "Unknown planner error.",
          );
        },
      })
    : undefined;

  try {
    if (startCommand && !(await isHttpUrlReachable(url))) {
      logStep("Starting the local app.");
      appProcess = runShellCommand(startCommand);
    }

    if (options.dryRun) {
      const summary = await runDemoAgentDryRun({
        guide,
        policy,
        policyHash: hash,
        planner,
        startUrl: url,
      });

      logSuccess("Dry-run complete.");
      logKeyValue("Run ID", summary.id);
      logKeyValue("Stop reason", summary.stopReason);
      logKeyValue("Evidence", summary.runDirectory);
      logInfo("Review the screenshots and action log before recording.");
      return;
    }

    const recording = await runDemoAgentRecording({
      guide,
      policy,
      policyHash: hash,
      planner,
      startUrl: url,
    });
    const recordingPath = recording.summary.recordingPath;

    if (!recordingPath) {
      throw new Error("The agent recording did not produce an MP4 path.");
    }

    logSuccess("Saved the agent recording.");
    logKeyValue("Run ID", recording.summary.id);
    logKeyValue("Stop reason", recording.summary.stopReason);
    logKeyValue("MP4", recordingPath);
    logKeyValue("Evidence", recording.summary.runDirectory);

    await reviewDemoAgentRecordingUpload(
      {
        apiBaseUrl,
        existingCredentials: plannerCredentials,
        guide,
        preferredProductId: options.product ?? config.productId,
        recording,
        upload: options.upload,
      },
      {
        confirmUpload: () =>
          confirm({
            default: false,
            message:
              "I reviewed the recording, screenshots, and action log. Upload this demo to ClipStitchr?",
          }),
        ensureCredentialsOrLogin,
        logInfo,
        logNextCommand,
        logStep,
        logSuccess,
        logWarning,
        selectProduct,
        uploadDemoFile,
        writeRunSummary: writeDemoAgentRunSummary,
      },
    );
  } finally {
    stopShellCommand(appProcess);
  }
}
