import { readCliPackageVersion } from "../config/readCliPackageVersion.js";
import { readCredentials } from "../config/readCredentials.js";
import { hasProjectConfig } from "../config/hasProjectConfig.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { detectProject } from "../project/detectProject.js";
import { isRecordingBrowserInstalled } from "../recording/isRecordingBrowserInstalled.js";
import { formatSuccessText } from "../terminal/formatSuccessText.js";
import { formatWarningText } from "../terminal/formatWarningText.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logKeyValue } from "../terminal/logKeyValue.js";

export async function runStatusCommand() {
  const [
    version,
    credentials,
    isLinked,
    config,
    project,
    recordingBrowserInstalled,
  ] = await Promise.all([
    readCliPackageVersion(),
    readCredentials(),
    hasProjectConfig(),
    readProjectConfig(),
    detectProject(),
    isRecordingBrowserInstalled(),
  ]);
  const isAccountConnected =
    credentials && new Date(credentials.expiresAt).getTime() > Date.now();

  logBrandHeader("Setup status");
  logKeyValue("CLI version", version);
  logKeyValue(
    "Account",
    isAccountConnected
      ? formatSuccessText("connected")
      : formatWarningText("not connected"),
  );
  logKeyValue(
    "Repo",
    isLinked ? formatSuccessText("linked") : formatWarningText("not linked"),
  );
  logKeyValue("Product", config.productId ?? formatWarningText("not set"));
  logKeyValue("Project type", project.type);
  logKeyValue(
    "Start command",
    config.target?.start ??
      project.startCommand ??
      formatWarningText("not found"),
  );
  logKeyValue("Local URL", config.target?.url ?? formatWarningText("not set"));
  logKeyValue(
    "App context",
    config.appContext?.path
      ? `${formatSuccessText("captured")} (${config.appContext.workflowHintCount ?? 0} workflows)`
      : formatWarningText("not captured"),
  );
  logKeyValue(
    "Recording browser",
    recordingBrowserInstalled
      ? formatSuccessText("installed")
      : formatWarningText("missing"),
  );
}
