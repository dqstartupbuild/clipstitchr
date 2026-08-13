import type { StudioReelGeminiAnalysis } from "./StudioReelGeminiAnalysis";

export type StudioReelCheckpointAnalysis = {
  readonly analysis: StudioReelGeminiAnalysis;
  readonly recipeId: string;
};
