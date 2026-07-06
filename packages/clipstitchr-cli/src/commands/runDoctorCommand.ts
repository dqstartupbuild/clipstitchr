import { readCredentials } from "../config/readCredentials.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { detectProject } from "../project/detectProject.js";
import { getNativeDoctorStatus } from "../native/getNativeDoctorStatus.js";
import { isRecordingBrowserInstalled } from "../recording/isRecordingBrowserInstalled.js";
import { formatSuccessText } from "../terminal/formatSuccessText.js";
import { formatWarningText } from "../terminal/formatWarningText.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logKeyValue } from "../terminal/logKeyValue.js";

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

  logBrandHeader("Recorder check");
  logKeyValue("Project type", project.type);
  logKeyValue(
    "Start command",
    config.target?.start ??
      project.startCommand ??
      formatWarningText("not found"),
  );
  logKeyValue("Local URL", config.target?.url ?? formatWarningText("not set"));
  logKeyValue(
    "Recording browser",
    recordingBrowserInstalled
      ? formatSuccessText("installed")
      : formatWarningText("missing"),
  );

  if (["ios", "react-native"].includes(project.type)) {
    logKeyValue(
      "Xcode tools",
      nativeDoctorStatus.xcrunAvailable
        ? formatSuccessText("installed")
        : formatWarningText("missing"),
    );
    logKeyValue(
      "iOS Simulator",
      nativeDoctorStatus.iosSimulatorName ?? formatWarningText("not running"),
    );
  }

  if (["android", "react-native"].includes(project.type)) {
    logKeyValue(
      "ADB",
      nativeDoctorStatus.adbAvailable
        ? formatSuccessText("installed")
        : formatWarningText("missing"),
    );
    logKeyValue(
      "Android device",
      nativeDoctorStatus.androidDeviceName ?? formatWarningText("not connected"),
    );
  }

  logKeyValue(
    "Account",
    credentials
      ? formatSuccessText("connected")
      : formatWarningText("not connected"),
  );
}
