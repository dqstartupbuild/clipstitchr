import type { CompetitorHookPattern } from "@/lib/clipstitchr/tools/competitorHookResearch/CompetitorHookPattern";

export type CompetitorHookObservation = {
  adLabel: string;
  appName: string;
  audienceInference: string;
  hookWords: string;
  id: string;
  intentInference: string;
  openingVisual: string;
  pattern: CompetitorHookPattern;
  productHandoff: string;
  proofShown: string;
};
