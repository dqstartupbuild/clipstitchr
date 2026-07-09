import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { readDemoAgentPolicy } from "../demoAgent/readDemoAgentPolicy.js";
import { writeDemoAgentPolicy } from "../demoAgent/writeDemoAgentPolicy.js";
import { editDemoAgentPolicy } from "../demoAgentPolicyEditor/editDemoAgentPolicy.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logSuccess } from "../terminal/logSuccess.js";

export async function runDemoAgentEditCommand(_options: CliGlobalOptions) {
  logBrandHeader("Edit demo agent policy");

  const { policy } = await readDemoAgentPolicy();
  const policyPath = await writeDemoAgentPolicy(
    await editDemoAgentPolicy(policy),
  );

  logSuccess("Updated the demo agent policy.");
  logKeyValue("Policy", policyPath);
}
