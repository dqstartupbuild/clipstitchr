import type { DetectedProject } from "../project/DetectedProject.js";
import type { RecordingResult } from "../recording/RecordingResult.js";
import { recordAndroidDeviceDemo } from "./recordAndroidDeviceDemo.js";
import { recordIosSimulatorDemo } from "./recordIosSimulatorDemo.js";
import { selectNativeRecordingTarget } from "./selectNativeRecordingTarget.js";

type RecordNativeDemoOptions = {
  outputPath?: string;
  projectType: DetectedProject["type"];
};

export async function recordNativeDemo(
  options: RecordNativeDemoOptions,
): Promise<RecordingResult> {
  const target = await selectNativeRecordingTarget(options.projectType);

  if (target === "ios-simulator") {
    return await recordIosSimulatorDemo({
      outputPath: options.outputPath,
    });
  }

  return await recordAndroidDeviceDemo({
    outputPath: options.outputPath,
  });
}
