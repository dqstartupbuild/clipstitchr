import type { CliprCompositionStrategy } from "@/lib/clipstitchr/types/CliprCompositionStrategy";
import type { CliprContentType } from "@/lib/clipstitchr/types/CliprContentType";
import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";

export type CliprTextGeneration = {
  compositionStrategy?: CliprCompositionStrategy;
  contentType?: CliprContentType;
  filledHook: string;
  hookStyleKey: string;
  hookTemplateId: string;
  overlayText: string;
  providerModel: string;
  scenePlan: CliprScenePlan[];
  script: string;
  slides: string[];
  variablesUsed: Record<string, string>;
};
