import { join } from "node:path";
import { confirm, input, select } from "@inquirer/prompts";
import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { ensureCredentialsOrLogin } from "./ensureCredentialsOrLogin.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { resolveApiBaseUrl } from "../config/resolveApiBaseUrl.js";
import { writeProjectConfig } from "../config/writeProjectConfig.js";
import { selectProduct } from "../interactive/selectProduct.js";
import { detectProject } from "../project/detectProject.js";
import { findRunningLocalAppUrl } from "../project/findRunningLocalAppUrl.js";
import { isHttpUrlReachable } from "../project/isHttpUrlReachable.js";
import { scanProjectFlows } from "../project/scanProjectFlows.js";
import { recordNativeDemo } from "../native/recordNativeDemo.js";
import type { RecordingResult } from "../recording/RecordingResult.js";
import { formatRecordingDuration } from "../recording/formatRecordingDuration.js";
import { isLongRecordingDuration } from "../recording/isLongRecordingDuration.js";
import { readRecordingVideoDuration } from "../recording/readRecordingVideoDuration.js";
import { recordWebDemo } from "../recording/recordWebDemo.js";
import { resolveRecordingGuidance } from "../recording/resolveRecordingGuidance.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logInfo } from "../terminal/logInfo.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logNextCommand } from "../terminal/logNextCommand.js";
import { logStep } from "../terminal/logStep.js";
import { logSuccess } from "../terminal/logSuccess.js";
import { logWarning } from "../terminal/logWarning.js";
import { uploadDemoFile } from "../upload/uploadDemoFile.js";

export type DemoMakeCommandOptions = CliGlobalOptions & {
  output?: string;
  product?: string;
  start?: string;
  upload?: boolean;
  url?: string;
};

export async function runDemoMakeCommand(options: DemoMakeCommandOptions) {
  logBrandHeader("Make a product demo");

  const config = await readProjectConfig();
  const recordingGuidance = resolveRecordingGuidance(config.recording);
  const apiBaseUrl = resolveApiBaseUrl(config, options.api);
  const credentials = await ensureCredentialsOrLogin(apiBaseUrl);
  const project = await detectProject();

  if (
    !["android", "expo", "ios", "react-native", "web"].includes(project.type)
  ) {
    throw new Error(
      `Recording ${project.type} apps is not built into this recorder yet. Export an MP4 and run \`clipstitchr demo upload ./demo.mp4\`.`,
    );
  }

  const product = await selectProduct(
    credentials,
    options.product ?? config.productId,
  );
  let recording: RecordingResult;
  let recordingLayout: "fit-with-background" | "smart-screen-demo" | undefined;
  let startCommand = options.start ?? config.target?.start;
  let url = options.url ?? config.target?.url;

  if (["web", "expo"].includes(project.type)) {
    const runningUrl = await findRunningLocalAppUrl(
      options.url ?? config.target?.url,
    );
    startCommand =
      startCommand ??
      (await input({
        default: project.startCommand,
        message: "How do you run this app locally?",
      }));
    url =
      options.url ??
      runningUrl ??
      config.target?.url ??
      (await input({
        default: "http://localhost:3000",
        message: "What local URL should I record?",
      }));
    const shouldStartApp = !(await isHttpUrlReachable(url));
    const flows = await scanProjectFlows(join(process.cwd(), project.directory));

    if (flows.length) {
      await select({
        choices: flows.map((flow) => ({
          name: `${flow.name}${flow.path ? ` (${flow.path})` : ""}`,
          value: flow.name,
        })),
        message: "Pick the flow you want to record first:",
      });
    }

    logStep("Opening the recording browser.");
    recording = await recordWebDemo({
      longRecordingWarningSeconds:
        recordingGuidance.longRecordingWarningSeconds,
      outputPath: options.output,
      startCommand: shouldStartApp ? startCommand : undefined,
      url,
    });
    recordingLayout = recording.interactionEvents?.length
      ? "smart-screen-demo"
      : "fit-with-background";
  } else {
    logStep("Starting mobile device recording.");
    recording = await recordNativeDemo({
      longRecordingWarningSeconds:
        recordingGuidance.longRecordingWarningSeconds,
      outputPath: options.output,
      projectType: project.type,
    });
  }

  await writeProjectConfig({
    ...config,
    apiBaseUrl,
    productId: product.id,
    recording: {
      format: "full-size",
      longRecordingWarningSeconds:
        recordingGuidance.longRecordingWarningSeconds,
      recommendedDurationSeconds: recordingGuidance.recommendedDurationSeconds,
    },
    target: {
      start: startCommand,
      type: project.type,
      url,
    },
  });

  logSuccess("Saved the recording.");
  logKeyValue("MP4", recording.outputPath);
  const durationSeconds = await readRecordingVideoDuration(recording.outputPath);
  const isLongRecording = isLongRecordingDuration(
    durationSeconds,
    recordingGuidance.longRecordingWarningSeconds,
  );

  if (durationSeconds !== null) {
    logKeyValue("Length", formatRecordingDuration(durationSeconds));
  }

  if (isLongRecording) {
    logInfo(
      "ClipStitchr will look for pauses, waiting time, and dead space during Quick Edit.",
    );
  }

  const shouldUpload =
    options.upload ??
    (await confirm({
      default: true,
      message: isLongRecording
        ? "This is a longer recording and may take more time to upload and process. Upload anyway?"
        : "Upload this demo to ClipStitchr?",
    }));

  if (!shouldUpload) {
    logNextCommand(`clipstitchr demo upload "${recording.outputPath}"`);
    return;
  }

  logStep("Uploading the demo to ClipStitchr.");
  if (isLongRecording) {
    logWarning("Longer demos may take more time to upload and process.");
  }
  await uploadDemoFile(credentials, {
    filePath: recording.outputPath,
    interactionEvents: recording.interactionEvents,
    layout: recordingLayout,
    productId: product.id,
    wait: true,
  });
  logSuccess("Uploaded to your Demo library.");
}
