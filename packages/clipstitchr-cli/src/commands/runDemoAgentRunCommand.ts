import { join } from "node:path";
import type { ChildProcess } from "node:child_process";
import { confirm } from "@inquirer/prompts";
import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { ensureCredentialsOrLogin } from "./ensureCredentialsOrLogin.js";
import { planDemoAgentActionWithAi } from "../api/planDemoAgentActionWithAi.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { resolveApiBaseUrl } from "../config/resolveApiBaseUrl.js";
import { writeProjectConfig } from "../config/writeProjectConfig.js";
import { createDemoAgentPlannerWithFallback } from "../demoAgent/createDemoAgentPlannerWithFallback.js";
import { createDemoAgentUnsupportedTargetMessage } from "../demoAgent/createDemoAgentUnsupportedTargetMessage.js";
import { getDemoAgentProjectCanUseTarget } from "../demoAgent/getDemoAgentProjectCanUseTarget.js";
import { resolveDemoAgentCommandDriver } from "../demoAgent/resolveDemoAgentCommandDriver.js";
import { resolveDemoAgentTargetMode } from "../demoAgent/resolveDemoAgentTargetMode.js";
import { resolveDemoAgentTargetUrl } from "../demoAgent/resolveDemoAgentTargetUrl.js";
import { runDemoAgentDryRun } from "../demoAgent/runDemoAgentDryRun.js";
import { runDemoAgentRecording } from "../demoAgent/runDemoAgentRecording.js";
import { resolveDemoWalkthroughGuide } from "../demoGuide/resolveDemoWalkthroughGuide.js";
import { selectProduct } from "../interactive/selectProduct.js";
import { detectProject } from "../project/detectProject.js";
import { createAppContextConfig } from "../project/createAppContextConfig.js";
import { findRunningLocalAppUrl } from "../project/findRunningLocalAppUrl.js";
import { isHttpUrlReachable } from "../project/isHttpUrlReachable.js";
import { scanAndWriteAppContext } from "../project/scanAndWriteAppContext.js";
import { scanProjectFlows } from "../project/scanProjectFlows.js";
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
import { readOrCreateDemoAutoPolicy } from "./readOrCreateDemoAutoPolicy.js";
import { writeDemoAgentRunSummary } from "../demoAgent/writeDemoAgentRunSummary.js";

type DemoAgentRunOptions = CliGlobalOptions & {
  aiPlanner?: boolean;
  driver?: string;
  dryRun?: boolean;
  guide?: string;
  product?: string;
  start?: string;
  target?: string;
  upload?: boolean;
  url?: string;
};

export async function runDemoAgentRunCommand(options: DemoAgentRunOptions) {
  logBrandHeader("Run the demo agent");

  if (!options.guide) {
    throw new Error("Choose a walkthrough guide with --guide.");
  }

  const config = await readProjectConfig();
  const apiBaseUrl = resolveApiBaseUrl(config, options.api);
  const project = await detectProject();
  const resolvedDriver = resolveDemoAgentCommandDriver({
    configDriver: config.demoAgent?.driver,
    configOpenAiModel: config.demoAgent?.openai?.model,
    optionDriver: options.driver,
  });
  const targetMode = resolveDemoAgentTargetMode({
    configTarget: config.demoAgent?.target,
    optionTarget: options.target,
    optionUrl: options.url,
  });

  if (
    !getDemoAgentProjectCanUseTarget({
      driver: resolvedDriver.driver,
      projectType: project.type,
      targetMode,
    })
  ) {
    throw new Error(
      createDemoAgentUnsupportedTargetMessage({
        projectType: project.type,
        targetMode,
      }),
    );
  }

  const flows = await scanProjectFlows(join(process.cwd(), project.directory));
  const appContext = await scanAndWriteAppContext({ flows, project });

  const guide = await resolveDemoWalkthroughGuide(options.guide);

  if (!guide) {
    throw new Error(`No walkthrough guide found for ${options.guide}.`);
  }

  const runningUrl =
    targetMode === "local"
      ? await findRunningLocalAppUrl(options.url ?? config.target?.url)
      : undefined;
  const url = resolveDemoAgentTargetUrl({
    configLiveUrl: config.demoAgent?.liveUrl,
    configUrl: config.target?.url,
    optionUrl: options.url,
    productWebsiteUrl: config.product?.websiteUrl,
    runningUrl,
    targetMode,
  });
  const startUrl = new URL(url);
  const { hash, policy } = await readOrCreateDemoAutoPolicy({
    allowLiveOrigins: targetMode === "live",
    allowedOrigin: startUrl.origin,
    flows,
    startPath: startUrl.pathname,
  });

  await writeProjectConfig({
    ...config,
    appContext: createAppContextConfig(appContext),
    demoAgent: {
      ...config.demoAgent,
      liveUrl: targetMode === "live" ? url : config.demoAgent?.liveUrl,
      target: targetMode,
    },
    target:
      targetMode === "local"
        ? {
            ...config.target,
            start: options.start ?? config.target?.start,
            type: project.type,
            url,
          }
        : {
            ...config.target,
            type: project.type,
          },
  });
  const startCommand =
    targetMode === "local" ? options.start ?? config.target?.start : undefined;
  let appProcess: ChildProcess | null = null;
  const plannerCredentials =
    options.aiPlanner && resolvedDriver.driver === "structured-planner"
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

  if (resolvedDriver.fallbackReason) {
    logWarning(resolvedDriver.fallbackReason);
  } else if (resolvedDriver.driver === "openai-computer") {
    logInfo("Using OpenAI Computer Use for browser control.");
  }

  try {
    if (targetMode === "local" && startCommand && !(await isHttpUrlReachable(url))) {
      logStep("Starting the local app.");
      appProcess = runShellCommand(startCommand);
    }

    if (options.dryRun) {
      const summary = await runDemoAgentDryRun({
        appContext,
        driver: resolvedDriver.driver,
        guide,
        openAiComputer: resolvedDriver.openAiComputer,
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
      appContext,
      driver: resolvedDriver.driver,
      guide,
      openAiComputer: resolvedDriver.openAiComputer,
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
