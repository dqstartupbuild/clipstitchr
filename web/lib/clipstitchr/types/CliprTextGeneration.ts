import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";

export type CliprTextGeneration = {
  filledHook: string;
  hookStyleKey: string;
  hookTemplateId: string;
  overlayText: string;
  providerModel: string;
  providerPredictionId?: string;
  scenePlan: CliprScenePlan[];
  script: string;
  slides: string[];
  variablesUsed: Record<string, string>;
};
