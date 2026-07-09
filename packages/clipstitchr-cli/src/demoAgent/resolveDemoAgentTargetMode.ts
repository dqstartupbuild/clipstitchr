import type { DemoAgentTargetMode } from "./DemoAgentTargetMode.js";
import { getDemoAgentTargetModeIsSupported } from "./getDemoAgentTargetModeIsSupported.js";
import { getDemoAgentUrlIsLocal } from "./getDemoAgentUrlIsLocal.js";

export function resolveDemoAgentTargetMode(input: {
  configTarget?: string;
  optionTarget?: string;
  optionUrl?: string;
}): DemoAgentTargetMode {
  const selectedTarget = input.optionTarget ?? input.configTarget;

  if (selectedTarget) {
    if (!getDemoAgentTargetModeIsSupported(selectedTarget)) {
      throw new Error("Use --target local or --target live.");
    }

    return selectedTarget;
  }

  if (input.optionUrl && !getDemoAgentUrlIsLocal(input.optionUrl)) {
    return "live";
  }

  return "local";
}
