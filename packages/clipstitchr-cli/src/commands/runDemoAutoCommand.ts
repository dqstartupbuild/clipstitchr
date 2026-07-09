import { join } from "node:path";
import type { ChildProcess } from "node:child_process";
import { generateDemoWalkthroughGuide } from "../api/generateDemoWalkthroughGuide.js";
import { planDemoAgentActionWithAi } from "../api/planDemoAgentActionWithAi.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { resolveApiBaseUrl } from "../config/resolveApiBaseUrl.js";
import { writeProjectConfig } from "../config/writeProjectConfig.js";
import { createProductConfigSummary } from "../config/createProductConfigSummary.js";
import { createDemoAgentPlannerWithFallback } from "../demoAgent/createDemoAgentPlannerWithFallback.js";
import { createDemoAgentPolicyHash } from "../demoAgent/createDemoAgentPolicyHash.js";
import { createDemoAgentUnsupportedTargetMessage } from "../demoAgent/createDemoAgentUnsupportedTargetMessage.js";
import { createNativeDemoAgentPolicy } from "../demoAgent/createNativeDemoAgentPolicy.js";
import { getDemoAgentProjectCanUseTarget } from "../demoAgent/getDemoAgentProjectCanUseTarget.js";
import { resolveDemoAgentCommandDriver } from "../demoAgent/resolveDemoAgentCommandDriver.js";
import { resolveDemoAgentSurface } from "../demoAgent/resolveDemoAgentSurface.js";
import { resolveDemoAgentTargetMode } from "../demoAgent/resolveDemoAgentTargetMode.js";
import { resolveDemoAgentTargetUrl } from "../demoAgent/resolveDemoAgentTargetUrl.js";
import { runMacosWindowDemoAgentRecording } from "../demoAgent/runMacosWindowDemoAgentRecording.js";
import { runDemoAgentRecording } from "../demoAgent/runDemoAgentRecording.js";
import { writeDemoWalkthroughGuide } from "../demoGuide/writeDemoWalkthroughGuide.js";
import { detectProject } from "../project/detectProject.js";
import { findRunningLocalAppUrl } from "../project/findRunningLocalAppUrl.js";
import { isHttpUrlReachable } from "../project/isHttpUrlReachable.js";
import { createAppContextConfig } from "../project/createAppContextConfig.js";
import { scanAndWriteAppContext } from "../project/scanAndWriteAppContext.js";
import { scanProjectFlows } from "../project/scanProjectFlows.js";
import { runShellCommand } from "../recording/runShellCommand.js";
import { stopShellCommand } from "../recording/stopShellCommand.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logInfo } from "../terminal/logInfo.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logStep } from "../terminal/logStep.js";
import { logSuccess } from "../terminal/logSuccess.js";
import type { DemoAutoCommandOptions } from "./DemoAutoCommandOptions.js";
import { createDemoAutoTargetAudience } from "./createDemoAutoTargetAudience.js";
import { readDemoAutoCredentials } from "./readDemoAutoCredentials.js";
import { readDemoAutoGoal } from "./readDemoAutoGoal.js";
import { readDemoAutoStepCount } from "./readDemoAutoStepCount.js";
import { readOrCreateDemoAutoPolicy } from "./readOrCreateDemoAutoPolicy.js";
import { resolveDemoAutoProduct } from "./resolveDemoAutoProduct.js";
import { reviewDemoAgentRecordingUpload } from "./reviewDemoAgentRecordingUpload.js";
import { selectDemoAutoFlow } from "./selectDemoAutoFlow.js";
import { sanitizeDemoAutoGuide } from "./sanitizeDemoAutoGuide.js";
import { ensureCredentialsOrLogin } from "./ensureCredentialsOrLogin.js";
import { selectProduct } from "../interactive/selectProduct.js";
import { uploadDemoFile } from "../upload/uploadDemoFile.js";
import { writeDemoAgentRunSummary } from "../demoAgent/writeDemoAgentRunSummary.js";
import { logNextCommand } from "../terminal/logNextCommand.js";
import { logWarning } from "../terminal/logWarning.js";
import { createDemoAutoGuideGenerationGoal } from "./createDemoAutoGuideGenerationGoal.js";

export async function runDemoAutoCommand(options: DemoAutoCommandOptions) {
  logBrandHeader("AI record a demo");

  const config = await readProjectConfig();
  const apiBaseUrl = resolveApiBaseUrl(config, options.api);
  const credentials = await readDemoAutoCredentials(apiBaseUrl);
  const project = await detectProject();
  const resolvedDriver = resolveDemoAgentCommandDriver({
    configDriver: config.demoAgent?.driver,
    configOpenAiMode: config.demoAgent?.openai?.mode,
    configOpenAiModel: config.demoAgent?.openai?.model,
    optionDriver: options.driver,
    optionOpenAiMode: options.openaiMode,
    relayCredentials: credentials,
  });
  const surface = resolveDemoAgentSurface({
    configSurface: config.demoAgent?.surface,
    optionSurface: options.surface,
  });
  const targetMode = resolveDemoAgentTargetMode({
    configTarget: config.demoAgent?.target,
    optionTarget: options.target,
    optionUrl: options.url,
  });

  if (
    surface === "browser" &&
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

  const product = await resolveDemoAutoProduct({
    credentials,
    preferredProductId: options.product ?? config.productId,
  });
  const flows = await scanProjectFlows(join(process.cwd(), project.directory));
  const appContext = await scanAndWriteAppContext({ flows, project });

  if (surface === "macos-window") {
    if (resolvedDriver.driver !== "openai-computer" || !resolvedDriver.openAiComputer) {
      throw new Error(
        "macOS window demos need --driver openai-computer with direct or relay OpenAI mode.",
      );
    }

    const goal = await readDemoAutoGoal({ goal: options.goal });
    const targetAudience = createDemoAutoTargetAudience({
      audience: options.audience,
      product,
    });
    const stepCount = readDemoAutoStepCount(options.steps);

    logStep("Writing the guide with ClipStitchr AI.");
    const guide = sanitizeDemoAutoGuide({
      guide: (
        await generateDemoWalkthroughGuide(credentials, {
          appContext,
          appType: project.type,
          availableFlows: flows,
          goal: `${goal} Record the selected macOS app window. Keep the demo inside that window.`,
          productId: product.id,
          stepCount,
          targetAudience,
        })
      ).guide,
      targetMode: "local",
    });
    const guidePath = await writeDemoWalkthroughGuide(guide);
    const policy = createNativeDemoAgentPolicy();
    const policyHash = createDemoAgentPolicyHash(policy);

    await writeProjectConfig({
      ...config,
      apiBaseUrl,
      appContext: createAppContextConfig(appContext),
      demoAgent: {
        ...config.demoAgent,
        openai: {
          ...config.demoAgent?.openai,
          mode: resolvedDriver.openAiComputer.mode,
        },
        surface,
      },
      product: createProductConfigSummary(product),
      productId: product.id,
      recording: {
        ...config.recording,
        demoGuideId: guide.id,
      },
      target: {
        ...config.target,
        type: project.type,
      },
    });

    logInfo(
      resolvedDriver.openAiComputer.mode === "relay"
        ? "Using OpenAI Computer Use through ClipStitchr relay. Screenshots are sent through ClipStitchr servers."
        : "Using OpenAI Computer Use with your local OpenAI key.",
    );

    const recording = await runMacosWindowDemoAgentRecording({
      appContext,
      guide,
      onWindowSelected: async (window) => {
        const currentConfig = await readProjectConfig();

        await writeProjectConfig({
          ...currentConfig,
          demoAgent: {
            ...currentConfig.demoAgent,
            macosWindowMatch:
              window.preferredMatch ?? config.demoAgent?.macosWindowMatch,
            surface,
          },
        });
      },
      openAiComputer: resolvedDriver.openAiComputer,
      policy,
      policyHash,
      preferredWindowMatch: config.demoAgent?.macosWindowMatch,
    });

    logSuccess("AI macOS window demo run complete.");
    logKeyValue("Guide ID", guide.id);
    logKeyValue("Guide", guidePath);
    logKeyValue("Run ID", recording.summary.id);
    logKeyValue("Stop reason", recording.summary.stopReason);
    logKeyValue("Evidence", recording.summary.runDirectory);
    logInfo(
      "macOS window runs currently save screenshots and action logs. MP4 capture is still handled by the browser and manual native recorders.",
    );
    return;
  }

  const runningUrl =
    targetMode === "local"
      ? await findRunningLocalAppUrl(options.url ?? config.target?.url)
      : undefined;
  const url = resolveDemoAgentTargetUrl({
    configLiveUrl: config.demoAgent?.liveUrl,
    configUrl: config.target?.url,
    optionUrl: options.url,
    productWebsiteUrl: product.websiteUrl,
    runningUrl,
    targetMode,
  });

  const selectedFlow = selectDemoAutoFlow({
    flows,
    localUrl: url,
    preferUrlPath: targetMode === "live",
  });
  const goal = await readDemoAutoGoal({
    flow: selectedFlow,
    goal: options.goal,
  });
  const targetAudience = createDemoAutoTargetAudience({
    audience: options.audience,
    product,
  });
  const stepCount = readDemoAutoStepCount(options.steps);
  const guideGoal = createDemoAutoGuideGenerationGoal({ goal, targetMode });
  const availableFlows =
    targetMode === "live" && selectedFlow ? [selectedFlow] : flows;
  const startCommand =
    targetMode === "local"
      ? options.start ?? config.target?.start ?? project.startCommand
      : undefined;
  let appProcess: ChildProcess | null = null;

  try {
    if (targetMode === "local" && startCommand && !(await isHttpUrlReachable(url))) {
      logStep("Starting the local app.");
      appProcess = runShellCommand(startCommand);
    }

    logStep("Writing the guide with ClipStitchr AI.");
    const guide = sanitizeDemoAutoGuide({
      guide: (
        await generateDemoWalkthroughGuide(credentials, {
          appContext,
          appType: project.type,
          availableFlows,
          flowName: selectedFlow?.name,
          flowPath: selectedFlow?.path,
          goal: guideGoal,
          productId: product.id,
          stepCount,
          targetAudience,
        })
      ).guide,
      targetMode,
    });
    const guidePath = await writeDemoWalkthroughGuide(guide);

    await writeProjectConfig({
      ...config,
      apiBaseUrl,
      appContext: createAppContextConfig(appContext),
      demoAgent: {
        ...config.demoAgent,
        liveUrl: targetMode === "live" ? url : config.demoAgent?.liveUrl,
        openai: {
          ...config.demoAgent?.openai,
          mode:
            resolvedDriver.openAiComputer?.mode ??
            config.demoAgent?.openai?.mode,
        },
        surface,
        target: targetMode,
      },
      product: createProductConfigSummary(product),
      productId: product.id,
      recording: {
        ...config.recording,
        demoGuideId: guide.id,
      },
      target:
        targetMode === "local"
          ? {
              ...config.target,
              start: startCommand,
              type: project.type,
              url,
            }
          : {
              ...config.target,
              type: project.type,
            },
    });

    const startUrl = new URL(url);
    const { hash, policy } = await readOrCreateDemoAutoPolicy({
      allowLiveOrigins: targetMode === "live",
      allowedOrigin: startUrl.origin,
      flows,
      startPath: startUrl.pathname,
    });
    const planner = createDemoAgentPlannerWithFallback({
      aiPlanner: (plannerInput) =>
        planDemoAgentActionWithAi(credentials, plannerInput),
      onFallback: (error) => {
        logWarning(
          "AI planner failed. Using the local planner for the rest of this run.",
        );
        logInfo(
          error instanceof Error ? error.message : "Unknown planner error.",
        );
      },
    });

    if (resolvedDriver.fallbackReason) {
      logWarning(resolvedDriver.fallbackReason);
    } else if (resolvedDriver.driver === "openai-computer") {
      logInfo(
        resolvedDriver.openAiComputer?.mode === "relay"
          ? "Using OpenAI Computer Use through ClipStitchr relay. Screenshots are sent through ClipStitchr servers."
          : "Using OpenAI Computer Use with your local OpenAI key.",
      );
    }

    logStep("Recording the demo with the guarded AI agent.");
    const recording = await runDemoAgentRecording({
      allowBrowserInstallPrompt: false,
      appContext,
      driver: resolvedDriver.driver,
      guide,
      openAiComputer: resolvedDriver.openAiComputer,
      planner:
        resolvedDriver.driver === "structured-planner" ? planner : undefined,
      policy,
      policyHash: hash,
      promptForSignIn: true,
      startUrl: url,
    });

    await reviewDemoAgentRecordingUpload(
      {
        apiBaseUrl,
        existingCredentials: credentials,
        guide,
        preferredProductId: product.id,
        recording,
        upload: false,
      },
      {
        confirmUpload: async () => false,
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

    logSuccess("AI demo recording complete.");
    logKeyValue("Guide ID", guide.id);
    logKeyValue("Guide", guidePath);
    logKeyValue("Run ID", recording.summary.id);
    logKeyValue("Stop reason", recording.summary.stopReason);

    if (recording.summary.recordingPath) {
      logKeyValue("MP4", recording.summary.recordingPath);
    }

    logKeyValue("Evidence", recording.summary.runDirectory);
  } finally {
    stopShellCommand(appProcess);
  }
}
