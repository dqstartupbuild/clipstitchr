import type { DemoAgentDriver } from "./DemoAgentDriver.js";
import { defaultDemoAgentDriver } from "./defaultDemoAgentDriver.js";
import { getDemoAgentDriverIsSupported } from "./getDemoAgentDriverIsSupported.js";

export function resolveDemoAgentDriver(input: {
  configDriver?: string;
  optionDriver?: string;
}): DemoAgentDriver {
  const selectedDriver =
    input.optionDriver ?? input.configDriver ?? defaultDemoAgentDriver;

  if (!getDemoAgentDriverIsSupported(selectedDriver)) {
    throw new Error(
      "Use --driver structured-planner or --driver openai-computer.",
    );
  }

  return selectedDriver;
}
