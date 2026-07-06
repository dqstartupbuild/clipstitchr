import { readCredentials } from "../config/readCredentials.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { detectProject } from "../project/detectProject.js";

export async function runDoctorCommand() {
  const [config, credentials, project] = await Promise.all([
    readProjectConfig(),
    readCredentials(),
    detectProject(),
  ]);

  console.log(`Project type: ${project.type}`);
  console.log(`Start command: ${config.target?.start ?? project.startCommand ?? "not found"}`);
  console.log(`Local URL: ${config.target?.url ?? "not set"}`);
  console.log(`Account: ${credentials ? "connected" : "not connected"}`);
}
