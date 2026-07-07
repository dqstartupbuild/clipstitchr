import { join } from "node:path";
import type { ChildProcess } from "node:child_process";
import { generateDemoWalkthroughGuide } from "../api/generateDemoWalkthroughGuide.js";
import { planDemoAgentActionWithAi } from "../api/planDemoAgentActionWithAi.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { resolveApiBaseUrl } from "../config/resolveApiBaseUrl.js";
import { writeProjectConfig } from "../config/writeProjectConfig.js";
import { createProductConfigSummary } from "../config/createProductConfigSummary.js";
import { createDemoAgentPlannerWithFallback } from "../demoAgent/createDemoAgentPlannerWithFallback.js";
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
import { ensureCredentialsOrLogin } from "./ensureCredentialsOrLogin.js";
import { selectProduct } from "../interactive/selectProduct.js";
import { uploadDemoFile } from "../upload/uploadDemoFile.js";
import { writeDemoAgentRunSummary } from "../demoAgent/writeDemoAgentRunSummary.js";
import { logNextCommand } from "../terminal/logNextCommand.js";
import { logWarning } from "../terminal/logWarning.js";

export async function runDemoAutoCommand(options: DemoAutoCommandOptions) {
  logBrandHeader("AI record a demo");

  const config = await readProjectConfig();
  const apiBaseUrl = resolveApiBaseUrl(config, options.api);
  const credentials = await readDemoAutoCredentials(apiBaseUrl);
  const project = await detectProject();

  if (!["expo", "web"].includes(project.type)) {
    throw new Error("AI demo recording only supports web and Expo web apps.");
  }

  const product = await resolveDemoAutoProduct({
    credentials,
    preferredProductId: options.product ?? config.productId,
  });
  const flows = await scanProjectFlows(join(process.cwd(), project.directory));
  const appContext = await scanAndWriteAppContext({ flows, project });
  const runningUrl = await findRunningLocalAppUrl(
    options.url ?? config.target?.url,
  );
  const url = options.url ?? runningUrl ?? config.target?.url;

  if (!url) {
    throw new Error("Run `clipstitchr link` with a local app URL first.");
  }

  const selectedFlow = selectDemoAutoFlow({ flows, localUrl: url });
  const goal = await readDemoAutoGoal({
    flow: selectedFlow,
    goal: options.goal,
  });
  const targetAudience = createDemoAutoTargetAudience({
    audience: options.audience,
    product,
  });
  const stepCount = readDemoAutoStepCount(options.steps);
  const startCommand = options.start ?? config.target?.start ?? project.startCommand;
  let appProcess: ChildProcess | null = null;

  try {
    if (startCommand && !(await isHttpUrlReachable(url))) {
      logStep("Starting the local app.");
      appProcess = runShellCommand(startCommand);
    }

    logStep("Writing the guide with ClipStitchr AI.");
    const guide = (
      await generateDemoWalkthroughGuide(credentials, {
        appContext,
        appType: project.type,
        availableFlows: flows,
        flowName: selectedFlow?.name,
        flowPath: selectedFlow?.path,
        goal,
        productId: product.id,
        stepCount,
        targetAudience,
      })
    ).guide;
    const guidePath = await writeDemoWalkthroughGuide(guide);

    await writeProjectConfig({
      ...config,
      apiBaseUrl,
      appContext: createAppContextConfig(appContext),
      product: createProductConfigSummary(product),
      productId: product.id,
      recording: {
        ...config.recording,
        demoGuideId: guide.id,
      },
      target: {
        ...config.target,
        start: startCommand,
        type: project.type,
        url,
      },
    });

    const startUrl = new URL(url);
    const { hash, policy } = await readOrCreateDemoAutoPolicy({
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

    logStep("Recording the demo with the guarded AI agent.");
    const recording = await runDemoAgentRecording({
      allowBrowserInstallPrompt: false,
      appContext,
      guide,
      planner,
      policy,
      policyHash: hash,
      promptForSignIn: false,
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
