import type { DetectedProject } from "../project/DetectedProject.js";
import type { DemoWalkthroughGuide } from "../demoGuide/DemoWalkthroughGuide.js";
import type { RecordingResult } from "../recording/RecordingResult.js";
import { recordAndroidDeviceDemo } from "./recordAndroidDeviceDemo.js";
import { recordIosSimulatorDemo } from "./recordIosSimulatorDemo.js";
import { selectNativeRecordingTarget } from "./selectNativeRecordingTarget.js";

type RecordNativeDemoOptions = {
  longRecordingWarningSeconds?: number;
  outputPath?: string;
  projectType: DetectedProject["type"];
  walkthroughGuide?: DemoWalkthroughGuide;
};

export async function recordNativeDemo(
  options: RecordNativeDemoOptions,
): Promise<RecordingResult> {
  const target = await selectNativeRecordingTarget(options.projectType);

  if (target === "ios-simulator") {
    return await recordIosSimulatorDemo({
      longRecordingWarningSeconds: options.longRecordingWarningSeconds,
      outputPath: options.outputPath,
      walkthroughGuide: options.walkthroughGuide,
    });
  }

  return await recordAndroidDeviceDemo({
    longRecordingWarningSeconds: options.longRecordingWarningSeconds,
    outputPath: options.outputPath,
    walkthroughGuide: options.walkthroughGuide,
  });
}
