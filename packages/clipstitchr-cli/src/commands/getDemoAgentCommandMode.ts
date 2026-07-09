import type { DemoAgentCommandOptions } from "./DemoAgentCommandOptions.js";

export function getDemoAgentCommandMode(options: DemoAgentCommandOptions) {
  return options.guide ? "saved-guide" : "create-guide";
}
