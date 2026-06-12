import type { CliprGenerationMode } from "../types/CliprGenerationMode";
import type { CliprResolvedGenerationMode } from "../types/CliprResolvedGenerationMode";
import { getSeededIndex } from "./getSeededIndex";

const randomModeOptions: CliprResolvedGenerationMode[] = [
  "script",
  "reaction",
  "broll",
];

export function getCliprResolvedGenerationMode({
  jobId,
  mode,
}: {
  jobId: string;
  mode: CliprGenerationMode;
}): CliprResolvedGenerationMode {
  if (mode !== "any") {
    return mode;
  }

  return randomModeOptions[getSeededIndex(jobId, randomModeOptions.length)];
}
