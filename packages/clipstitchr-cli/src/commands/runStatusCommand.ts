import { readCliPackageVersion } from "../config/readCliPackageVersion.js";
import { readCredentials } from "../config/readCredentials.js";
import { hasProjectConfig } from "../config/hasProjectConfig.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { detectProject } from "../project/detectProject.js";
import { isRecordingBrowserInstalled } from "../recording/isRecordingBrowserInstalled.js";

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

  console.log(`CLI version: ${version}`);
  console.log(`Account: ${isAccountConnected ? "connected" : "not connected"}`);
  console.log(`Repo: ${isLinked ? "linked" : "not linked"}`);
  console.log(`Product: ${config.productId ?? "not set"}`);
  console.log(`Project type: ${project.type}`);
  console.log(
    `Start command: ${config.target?.start ?? project.startCommand ?? "not found"}`,
  );
  console.log(`Local URL: ${config.target?.url ?? "not set"}`);
  console.log(
    `Recording browser: ${recordingBrowserInstalled ? "installed" : "missing"}`,
  );
}
