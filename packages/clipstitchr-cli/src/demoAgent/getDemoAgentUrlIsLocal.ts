import { getIsDemoAgentLocalOrigin } from "./getIsDemoAgentLocalOrigin.js";

export function getDemoAgentUrlIsLocal(url: string) {
  try {
    return getIsDemoAgentLocalOrigin(new URL(url).origin);
  } catch {
    return false;
  }
}
