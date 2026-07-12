import type { HookEdgeLevel } from "@/lib/clipstitchr/types/HookEdgeLevel";
import type { HookGenerationGoal } from "@/lib/clipstitchr/types/HookGenerationGoal";
import type { HookLabTextBlueprint } from "@/lib/clipstitchr/types/HookLabTextBlueprint";

export type ProductProfile = {
  id: string;
  name: string;
  productDetails: string;
  audienceDetails: string;
  emotionalNarrative?: string;
  websiteUrl?: string;
  cliprPlaceholderFillers?: Record<string, string[]>;
  eligibleCliprHookStyleKeys?: string[];
  eligibleCliprHookTemplateIds?: string[];
  hookEdgeLevel?: HookEdgeLevel;
  hookGenerationGoal?: HookGenerationGoal;
  hookLabTextBlueprints?: HookLabTextBlueprint[];
  inferredProblem?: string;
  inferredPainPoints: string[];
  preferredCliprHookStyleKey?: string;
  postBridgeSocialAccountIds?: number[];
  rejectedHookExamples?: string[];
  winningHookExamples?: string[];
  createdAt: string;
  updatedAt: string;
};
