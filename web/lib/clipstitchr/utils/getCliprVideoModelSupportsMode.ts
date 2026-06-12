import type { CliprResolvedGenerationMode } from "@/lib/clipstitchr/types/CliprResolvedGenerationMode";
import type { CliprVideoModelId } from "@/lib/clipstitchr/types/CliprVideoModelId";
import { getCliprVideoModelOption } from "@/lib/clipstitchr/utils/getCliprVideoModelOption";

export function getCliprVideoModelSupportsMode(
  id: CliprVideoModelId,
  mode: CliprResolvedGenerationMode,
) {
  return getCliprVideoModelOption(id).modes.includes(mode);
}
