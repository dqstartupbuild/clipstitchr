import { spawn } from "node:child_process";
import { stat } from "node:fs/promises";
import { confirm, input } from "@inquirer/prompts";
import type { RecordingResult } from "../recording/RecordingResult.js";
import { createRecordingOutputPath } from "../recording/createRecordingOutputPath.js";
import { getBootedIosSimulator } from "./getBootedIosSimulator.js";
import { isCommandAvailable } from "./isCommandAvailable.js";
import { openIosSimulatorApp } from "./openIosSimulatorApp.js";
import { waitForChildProcessExit } from "./waitForChildProcessExit.js";

type RecordIosSimulatorDemoOptions = {
  outputPath?: string;
};

export async function recordIosSimulatorDemo(
  options: RecordIosSimulatorDemoOptions,
): Promise<RecordingResult> {
  if (process.platform !== "darwin" || !(await isCommandAvailable("xcrun"))) {
    throw new Error(
      "iOS Simulator recording needs Xcode command line tools on macOS.",
    );
  }

  let simulator = await getBootedIosSimulator();

  if (!simulator) {
    const shouldOpenSimulator = await confirm({
      default: true,
      message: "No iOS Simulator is running. Open Simulator now?",
    });

    if (shouldOpenSimulator) {
      openIosSimulatorApp();
    }

    await input({
      message:
        "Open your app in a booted iOS Simulator, then press Enter here.",
    });
    simulator = await getBootedIosSimulator();
  }

  if (!simulator) {
    throw new Error("No booted iOS Simulator was found.");
  }

  await input({
    message: `Open the demo screen in ${simulator.name}, then press Enter to start recording.`,
  });

  const outputPath =
    options.outputPath ?? (await createRecordingOutputPath(process.cwd()));
  const recordingProcess = spawn(
    "xcrun",
    ["simctl", "io", simulator.udid, "recordVideo", "--codec=h264", outputPath],
    {
      stdio: ["ignore", "inherit", "inherit"],
    },
  );

  await input({
    message:
      "Walk through the demo in the Simulator, then press Enter here to finish.",
  });

  recordingProcess.kill("SIGINT");
  await waitForChildProcessExit(recordingProcess);
  await stat(outputPath);

  return {
    outputPath,
    rawVideoPath: outputPath,
  };
}
