import type { DemoAgentDriver } from "./DemoAgentDriver.js";
import type { DemoAgentOpenAiComputerOptions } from "./DemoAgentOpenAiComputerOptions.js";

export type DemoAgentResolvedDriver = {
  driver: DemoAgentDriver;
  fallbackReason?: string;
  openAiComputer?: DemoAgentOpenAiComputerOptions;
};
