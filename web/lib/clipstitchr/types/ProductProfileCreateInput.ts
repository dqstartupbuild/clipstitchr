import type { HookEdgeLevel } from "@/lib/clipstitchr/types/HookEdgeLevel";
import type { HookGenerationGoal } from "@/lib/clipstitchr/types/HookGenerationGoal";

export type ProductProfileCreateInput = {
  name: string;
  productDetails: string;
  audienceDetails: string;
  emotionalNarrative?: string;
  websiteUrl?: string;
  hookEdgeLevel?: HookEdgeLevel;
  hookGenerationGoal?: HookGenerationGoal;
  inferredProblem?: string;
  inferredPainPoints?: string[];
  preferredCliprHookStyleKey?: string;
  rejectedHookExamples?: string[];
  winningHookExamples?: string[];
};
