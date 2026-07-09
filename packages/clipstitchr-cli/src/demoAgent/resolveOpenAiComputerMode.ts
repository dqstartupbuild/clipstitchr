import type { OpenAiComputerMode } from "./OpenAiComputerMode.js";
import { getOpenAiComputerModeIsSupported } from "./getOpenAiComputerModeIsSupported.js";

export function resolveOpenAiComputerMode(input: {
  configMode?: string;
  hasClipstitchrCredentials?: boolean;
  hasLocalOpenAiApiKey?: boolean;
  optionMode?: string;
}): OpenAiComputerMode {
  const selectedMode =
    input.optionMode ??
    input.configMode ??
    (input.hasLocalOpenAiApiKey ? "direct" : undefined) ??
    (input.hasClipstitchrCredentials ? "relay" : "direct");

  if (!getOpenAiComputerModeIsSupported(selectedMode)) {
    throw new Error("Use --openai-mode direct or --openai-mode relay.");
  }

  return selectedMode;
}
