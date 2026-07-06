import { readCredentials } from "../config/readCredentials.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { detectProject } from "../project/detectProject.js";
import { isRecordingBrowserInstalled } from "../recording/isRecordingBrowserInstalled.js";

export async function runDoctorCommand() {
  const [config, credentials, project, recordingBrowserInstalled] =
    await Promise.all([
      readProjectConfig(),
      readCredentials(),
      detectProject(),
      isRecordingBrowserInstalled(),
    ]);

  console.log(`Project type: ${project.type}`);
  console.log(
    `Start command: ${config.target?.start ?? project.startCommand ?? "not found"}`,
  );
  console.log(`Local URL: ${config.target?.url ?? "not set"}`);
  console.log(
    `Recording browser: ${recordingBrowserInstalled ? "installed" : "missing"}`,
  );
  console.log(`Account: ${credentials ? "connected" : "not connected"}`);
}
