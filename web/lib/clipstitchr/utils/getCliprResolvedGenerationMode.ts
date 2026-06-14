import { isCliprScriptModeEnabled } from "../constants/isCliprScriptModeEnabled";
import type { CliprGenerationMode } from "../types/CliprGenerationMode";
import type { CliprResolvedGenerationMode } from "../types/CliprResolvedGenerationMode";
import { getSeededIndex } from "./getSeededIndex";

const enabledRandomModeOptions: CliprResolvedGenerationMode[] = [
  "script",
  "reaction",
  "broll",
];
const hiddenScriptRandomModeOptions: CliprResolvedGenerationMode[] = [
  "reaction",
  "broll",
];

function getRandomModeOptions() {
  return isCliprScriptModeEnabled
    ? enabledRandomModeOptions
    : hiddenScriptRandomModeOptions;
}

export function getCliprResolvedGenerationMode({
  jobId,
  mode,
}: {
  jobId: string;
  mode: CliprGenerationMode;
}): CliprResolvedGenerationMode {
  const randomModeOptions = getRandomModeOptions();

  if (mode === "script" && !isCliprScriptModeEnabled) {
    return randomModeOptions[getSeededIndex(jobId, randomModeOptions.length)];
  }

  if (mode !== "any") {
    return mode;
  }

  return randomModeOptions[getSeededIndex(jobId, randomModeOptions.length)];
}
