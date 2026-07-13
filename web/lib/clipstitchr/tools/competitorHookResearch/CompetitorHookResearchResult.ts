import type { CompetitorHookPatternCount } from "@/lib/clipstitchr/tools/competitorHookResearch/CompetitorHookPatternCount";

export type CompetitorHookResearchResult = {
  evidence: readonly string[];
  inferences: readonly string[];
  observationsUsed: number;
  patternCounts: readonly CompetitorHookPatternCount[];
  researchQuestions: readonly string[];
};
