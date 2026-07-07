import { spawn } from "node:child_process";
import { stat } from "node:fs/promises";
import { basename } from "node:path";
import { input } from "@inquirer/prompts";
import type { DemoWalkthroughGuide } from "../demoGuide/DemoWalkthroughGuide.js";
import { runDemoWalkthroughStepper } from "../demoGuide/runDemoWalkthroughStepper.js";
import type { RecordingResult } from "../recording/RecordingResult.js";
import { createRecordingOutputPath } from "../recording/createRecordingOutputPath.js";
import { startLongRecordingWarningTimer } from "../recording/startLongRecordingWarningTimer.js";
import { warnIfNativeRecordingLooksUnusual } from "../recording/warnIfNativeRecordingLooksUnusual.js";
import { getConnectedAndroidDevice } from "./getConnectedAndroidDevice.js";
import { isCommandAvailable } from "./isCommandAvailable.js";
import { runNativeCommand } from "./runNativeCommand.js";
import { waitForChildProcessExit } from "./waitForChildProcessExit.js";

type RecordAndroidDeviceDemoOptions = {
  longRecordingWarningSeconds?: number;
  outputPath?: string;
  walkthroughGuide?: DemoWalkthroughGuide;
};

export async function recordAndroidDeviceDemo(
  options: RecordAndroidDeviceDemoOptions,
): Promise<RecordingResult> {
  if (!(await isCommandAvailable("adb", ["version"]))) {
    throw new Error("Android recording needs Android Debug Bridge (`adb`).");
  }

  const device = await getConnectedAndroidDevice();

  if (!device) {
    throw new Error("No Android emulator or device is connected with ADB.");
  }

  await input({
    message: `Open the demo screen on ${device.name}, then press Enter to start recording.`,
  });

  const outputPath =
    options.outputPath ?? (await createRecordingOutputPath(process.cwd()));
  const remotePath = `/sdcard/${basename(outputPath)}`;
  const recordingProcess = spawn(
    "adb",
    ["-s", device.id, "shell", "screenrecord", remotePath],
    {
      stdio: ["ignore", "inherit", "inherit"],
    },
  );

  const stopLongRecordingWarning = startLongRecordingWarningTimer(
    options.longRecordingWarningSeconds ?? 0,
  );
  let walkthroughTimings: RecordingResult["walkthroughTimings"];

  try {
    walkthroughTimings = options.walkthroughGuide
      ? await runDemoWalkthroughStepper(options.walkthroughGuide)
      : undefined;

    if (!options.walkthroughGuide) {
      await input({
        message:
          "Walk through the demo on the device, then press Enter here to finish.",
      });
    }
  } finally {
    stopLongRecordingWarning();
  }

  recordingProcess.kill("SIGINT");
  await waitForChildProcessExit(recordingProcess);
  await runNativeCommand("adb", ["-s", device.id, "pull", remotePath, outputPath]);
  await runNativeCommand("adb", ["-s", device.id, "shell", "rm", remotePath]).catch(
    () => undefined,
  );
  await stat(outputPath);
  await warnIfNativeRecordingLooksUnusual(outputPath);

  return {
    outputPath,
    rawVideoPath: outputPath,
    walkthroughTimings,
  };
}
