import { join } from "node:path";
import { input } from "@inquirer/prompts";
import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { createDemoAgentPolicy } from "../demoAgent/createDemoAgentPolicy.js";
import { getIsDemoAgentLocalOrigin } from "../demoAgent/getIsDemoAgentLocalOrigin.js";
import { writeDemoAgentPolicy } from "../demoAgent/writeDemoAgentPolicy.js";
import { detectProject } from "../project/detectProject.js";
import { scanProjectFlows } from "../project/scanProjectFlows.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logSuccess } from "../terminal/logSuccess.js";

export async function runDemoAgentInitCommand(_options: CliGlobalOptions) {
  logBrandHeader("Set up the local demo agent");

  const config = await readProjectConfig();
  const project = await detectProject();
  const url = await input({
    default: config.target?.url ?? "http://localhost:3000",
    message: "What local URL is the agent allowed to use?",
  });
  const allowedOrigin = new URL(url).origin;

  if (!getIsDemoAgentLocalOrigin(allowedOrigin)) {
    throw new Error("The local demo agent only supports localhost app URLs.");
  }

  const flows = await scanProjectFlows(join(process.cwd(), project.directory));
  const policyPath = await writeDemoAgentPolicy(
    createDemoAgentPolicy({
      allowedOrigin,
      flows,
    }),
  );

  logSuccess("Created the local demo agent policy.");
  logKeyValue("Policy", policyPath);
}
