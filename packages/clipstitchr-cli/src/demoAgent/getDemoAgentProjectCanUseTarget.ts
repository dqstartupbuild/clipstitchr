import type { DemoAgentDriver } from "./DemoAgentDriver.js";
import type { DemoAgentTargetMode } from "./DemoAgentTargetMode.js";

export function getDemoAgentProjectCanUseTarget(input: {
  driver: DemoAgentDriver;
  projectType: string;
  targetMode: DemoAgentTargetMode;
}) {
  if (input.projectType === "expo" || input.projectType === "web") {
    return true;
  }

  return input.driver === "openai-computer" && input.targetMode === "live";
}
