import type { DemoAgentResolvedDriver } from "./DemoAgentResolvedDriver.js";
import { readOpenAiApiKey } from "./readOpenAiApiKey.js";
import { resolveDemoAgentDriver } from "./resolveDemoAgentDriver.js";
import { resolveOpenAiComputerModel } from "./resolveOpenAiComputerModel.js";

export function resolveDemoAgentCommandDriver(input: {
  configDriver?: string;
  configOpenAiModel?: string;
  optionDriver?: string;
}): DemoAgentResolvedDriver {
  const driver = resolveDemoAgentDriver({
    configDriver: input.configDriver,
    optionDriver: input.optionDriver,
  });

  if (driver !== "openai-computer") {
    return { driver };
  }

  const apiKey = readOpenAiApiKey();

  if (!apiKey) {
    return {
      driver: "structured-planner",
      fallbackReason:
        "OPENAI_API_KEY is not set. Using the structured planner for this run.",
    };
  }

  return {
    driver,
    openAiComputer: {
      apiKey,
      model: resolveOpenAiComputerModel(input.configOpenAiModel),
    },
  };
}
