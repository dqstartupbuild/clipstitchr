import type { CliprResolvedGenerationMode } from "@/lib/clipstitchr/types/CliprResolvedGenerationMode";
import type { CliprVideoModelId } from "@/lib/clipstitchr/types/CliprVideoModelId";
import { cliprVideoModelOptions } from "@/lib/clipstitchr/constants/cliprVideoModelOptions";

export function getCliprVideoModelSupportsMode(
  id: CliprVideoModelId,
  mode: CliprResolvedGenerationMode,
) {
  return (
    cliprVideoModelOptions.find((option) => option.id === id)?.modes.includes(
      mode,
    ) ?? false
  );
}
