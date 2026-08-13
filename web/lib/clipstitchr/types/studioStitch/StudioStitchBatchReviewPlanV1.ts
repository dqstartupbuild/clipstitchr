export type StudioStitchBatchReviewPlanV1 = {
  readonly planVersion: 1;
  readonly strategy: "hookFamilyCoverageThenRecipeId";
  readonly requestedCount: number;
  readonly totalCount: number;
  readonly selectedRecipeIds: readonly string[];
  readonly remainingRecipeIds: readonly string[];
  readonly coverageKeys: readonly string[];
};
