import { readCredentials } from "../config/readCredentials.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { detectProject } from "../project/detectProject.js";
import { getNativeDoctorStatus } from "../native/getNativeDoctorStatus.js";
import { isRecordingBrowserInstalled } from "../recording/isRecordingBrowserInstalled.js";

export async function runDoctorCommand() {
  const [
    config,
    credentials,
    project,
    recordingBrowserInstalled,
    nativeDoctorStatus,
  ] = await Promise.all([
      readProjectConfig(),
      readCredentials(),
      detectProject(),
      isRecordingBrowserInstalled(),
      getNativeDoctorStatus(),
    ]);

  console.log(`Project type: ${project.type}`);
  console.log(
    `Start command: ${config.target?.start ?? project.startCommand ?? "not found"}`,
  );
  console.log(`Local URL: ${config.target?.url ?? "not set"}`);
  console.log(
    `Recording browser: ${recordingBrowserInstalled ? "installed" : "missing"}`,
  );

  if (["ios", "react-native"].includes(project.type)) {
    console.log(
      `Xcode tools: ${nativeDoctorStatus.xcrunAvailable ? "installed" : "missing"}`,
    );
    console.log(
      `iOS Simulator: ${nativeDoctorStatus.iosSimulatorName ?? "not running"}`,
    );
  }

  if (["android", "react-native"].includes(project.type)) {
    console.log(
      `ADB: ${nativeDoctorStatus.adbAvailable ? "installed" : "missing"}`,
    );
    console.log(
      `Android device: ${nativeDoctorStatus.androidDeviceName ?? "not connected"}`,
    );
  }

  console.log(`Account: ${credentials ? "connected" : "not connected"}`);
}
