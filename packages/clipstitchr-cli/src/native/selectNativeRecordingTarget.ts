import { select } from "@inquirer/prompts";
import type { DetectedProject } from "../project/DetectedProject.js";
import type { NativeRecordingTarget } from "./NativeRecordingTarget.js";

export async function selectNativeRecordingTarget(
  projectType: DetectedProject["type"],
): Promise<NativeRecordingTarget> {
  if (projectType === "ios") {
    return "ios-simulator";
  }

  if (projectType === "android") {
    return "android-device";
  }

  return await select({
    choices: [
      {
        name: "iOS Simulator",
        value: "ios-simulator" as const,
      },
      {
        name: "Android emulator or device",
        value: "android-device" as const,
      },
    ],
    message: "What should I record?",
  });
}
