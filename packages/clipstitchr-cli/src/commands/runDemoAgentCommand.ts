import { runDemoAgentRunCommand } from "./runDemoAgentRunCommand.js";
import { runDemoAutoCommand } from "./runDemoAutoCommand.js";
import type { DemoAgentCommandOptions } from "./DemoAgentCommandOptions.js";
import { getDemoAgentCommandMode } from "./getDemoAgentCommandMode.js";

export async function runDemoAgentCommand(options: DemoAgentCommandOptions) {
  if (getDemoAgentCommandMode(options) === "saved-guide") {
    await runDemoAgentRunCommand(options);
    return;
  }

  await runDemoAutoCommand({
    ...options,
    confirmUpload: options.upload !== false,
  });
}
