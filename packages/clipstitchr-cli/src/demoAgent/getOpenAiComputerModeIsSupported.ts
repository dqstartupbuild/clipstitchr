import type { OpenAiComputerMode } from "./OpenAiComputerMode.js";

export function getOpenAiComputerModeIsSupported(
  mode: string,
): mode is OpenAiComputerMode {
  return mode === "direct" || mode === "relay";
}
