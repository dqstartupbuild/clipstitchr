import { join } from "node:path";
import { input } from "@inquirer/prompts";
import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { writeProjectConfig } from "../config/writeProjectConfig.js";
import { createDemoAgentPolicy } from "../demoAgent/createDemoAgentPolicy.js";
import { writeDemoAgentPolicy } from "../demoAgent/writeDemoAgentPolicy.js";
import { editDemoAgentPolicy } from "../demoAgentPolicyEditor/editDemoAgentPolicy.js";
import { createAppContextConfig } from "../project/createAppContextConfig.js";
import { detectProject } from "../project/detectProject.js";
import { scanAndWriteAppContext } from "../project/scanAndWriteAppContext.js";
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
    message: "What app URL is the agent allowed to use?",
  });
  const allowedOrigin = new URL(url).origin;

  const flows = await scanProjectFlows(join(process.cwd(), project.directory));
  const appContext = await scanAndWriteAppContext({ flows, project });
  const policy = await editDemoAgentPolicy(
    createDemoAgentPolicy({
      allowedOrigin,
      flows,
    }),
  );
  const policyPath = await writeDemoAgentPolicy(policy);

  await writeProjectConfig({
    ...config,
    appContext: createAppContextConfig(appContext),
    target: {
      ...config.target,
      type: project.type,
      url,
    },
  });

  logSuccess("Created the local demo agent policy.");
  logKeyValue("Policy", policyPath);
  logKeyValue("App context", ".clipstitchr/app-context.json");
}
