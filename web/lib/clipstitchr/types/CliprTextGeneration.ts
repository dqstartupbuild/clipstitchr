import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";

export type CliprTextGeneration = {
  caption: string;
  description: string;
  filledHook: string;
  hashtags: string[];
  hookStyleKey: string;
  hookTemplateId: string;
  overlayText: string;
  providerModel: string;
  providerPredictionId?: string;
  scenePlan: CliprScenePlan[];
  script: string;
  slides: string[];
  socialCaption: string;
  variablesUsed: Record<string, string>;
};
