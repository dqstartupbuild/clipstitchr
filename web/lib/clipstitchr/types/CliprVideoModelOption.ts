import type { CliprResolvedGenerationMode } from "@/lib/clipstitchr/types/CliprResolvedGenerationMode";
import type { CliprVideoModelId } from "@/lib/clipstitchr/types/CliprVideoModelId";

export type CliprVideoModelOption = {
  id: CliprVideoModelId;
  label: string;
  modes: CliprResolvedGenerationMode[];
};
