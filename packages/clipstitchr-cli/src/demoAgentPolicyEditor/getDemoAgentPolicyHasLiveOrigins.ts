import { getIsDemoAgentLocalOrigin } from "../demoAgent/getIsDemoAgentLocalOrigin.js";

export function getDemoAgentPolicyHasLiveOrigins(allowedOrigins: string[]) {
  return allowedOrigins.some((origin) => !getIsDemoAgentLocalOrigin(origin));
}
