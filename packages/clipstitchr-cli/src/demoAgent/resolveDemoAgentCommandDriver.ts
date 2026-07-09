import type { DemoAgentResolvedDriver } from "./DemoAgentResolvedDriver.js";
import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import { readOpenAiApiKey } from "./readOpenAiApiKey.js";
import { resolveDemoAgentDriver } from "./resolveDemoAgentDriver.js";
import { resolveOpenAiComputerMode } from "./resolveOpenAiComputerMode.js";
import { resolveOpenAiComputerModel } from "./resolveOpenAiComputerModel.js";

export function resolveDemoAgentCommandDriver(input: {
  configDriver?: string;
  configOpenAiMode?: string;
  configOpenAiModel?: string;
  optionDriver?: string;
  optionOpenAiMode?: string;
  relayCredentials?: ClipstitchrCredentials;
}): DemoAgentResolvedDriver {
  const driver = resolveDemoAgentDriver({
    configDriver: input.configDriver,
    optionDriver: input.optionDriver,
  });

  if (driver !== "openai-computer") {
    return { driver };
  }

  const apiKey = readOpenAiApiKey();
  const mode = resolveOpenAiComputerMode({
    configMode: input.configOpenAiMode,
    hasClipstitchrCredentials: Boolean(input.relayCredentials),
    hasLocalOpenAiApiKey: Boolean(apiKey),
    optionMode: input.optionOpenAiMode,
  });

  if (mode === "relay") {
    if (!input.relayCredentials) {
      return {
        driver: "structured-planner",
        fallbackReason:
          "ClipStitchr login is not available for OpenAI relay mode. Using the structured planner for this run.",
      };
    }

    return {
      driver,
      openAiComputer: {
        credentials: input.relayCredentials,
        mode,
        model: resolveOpenAiComputerModel(input.configOpenAiModel),
      },
    };
  }

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
      mode,
      model: resolveOpenAiComputerModel(input.configOpenAiModel),
    },
  };
}
