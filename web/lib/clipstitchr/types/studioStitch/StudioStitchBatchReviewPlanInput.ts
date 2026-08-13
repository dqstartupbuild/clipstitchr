import type { StudioStitchRecipeV1 } from "./StudioStitchRecipeV1";

export type StudioStitchBatchReviewPlanInput = {
  readonly recipes: readonly StudioStitchRecipeV1[];
  readonly requestedCount?: number;
};
