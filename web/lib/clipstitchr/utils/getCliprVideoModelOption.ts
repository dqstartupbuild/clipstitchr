import { cliprVideoModelOptions } from "@/lib/clipstitchr/constants/cliprVideoModelOptions";
import type { CliprVideoModelId } from "@/lib/clipstitchr/types/CliprVideoModelId";

export function getCliprVideoModelOption(id: CliprVideoModelId) {
  return (
    cliprVideoModelOptions.find((option) => option.id === id) ??
    cliprVideoModelOptions[0]
  );
}
