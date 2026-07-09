import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { readDemoAgentPolicy } from "../demoAgent/readDemoAgentPolicy.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logSuccess } from "../terminal/logSuccess.js";

export async function runDemoAgentCheckCommand(_options: CliGlobalOptions) {
  logBrandHeader("Check demo agent policy");

  const { hash, path, policy } = await readDemoAgentPolicy();

  logSuccess("Policy is valid.");
  logKeyValue("Policy", path);
  logKeyValue("Hash", hash.slice(0, 16));
  logKeyValue("Origins", policy.allowedOrigins.join(", "));
  logKeyValue("Routes", policy.allowedRoutes.join(", "));
  logKeyValue("Max actions", String(policy.maxActions));
}
