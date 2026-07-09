import type { DemoAgentDriver } from "./DemoAgentDriver.js";

export function getDemoAgentDriverIsSupported(
  value: string,
): value is DemoAgentDriver {
  return value === "structured-planner" || value === "openai-computer";
}
