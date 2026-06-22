import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";
import type { StitchrHookVariant } from "@/lib/clipstitchr/types/StitchrHookVariant";

export type CliprTextGeneration = {
  caption: string;
  description: string;
  filledHook: string;
  hashtags: string[];
  hookVariants: StitchrHookVariant[];
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
