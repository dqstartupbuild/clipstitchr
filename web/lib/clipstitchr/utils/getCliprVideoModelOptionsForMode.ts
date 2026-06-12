import { cliprVideoModelOptions } from "@/lib/clipstitchr/constants/cliprVideoModelOptions";
import type { CliprGenerationMode } from "@/lib/clipstitchr/types/CliprGenerationMode";

export function getCliprVideoModelOptionsForMode(mode: CliprGenerationMode) {
  if (mode === "any") {
    return cliprVideoModelOptions.filter((option) => option.id === "auto");
  }

  return cliprVideoModelOptions.filter(
    (option) => option.id === "auto" || option.modes.includes(mode),
  );
}
