import type { StudioStitchBatchReviewPlanInput } from "../../types/studioStitch/StudioStitchBatchReviewPlanInput";
import type { StudioStitchBatchReviewPlanV1 } from "../../types/studioStitch/StudioStitchBatchReviewPlanV1";
import type { StudioStitchRecipeV1 } from "../../types/studioStitch/StudioStitchRecipeV1";
import { assertStudioStitchRecipeV1 } from "./assertStudioStitchRecipeV1";
import { deepFreezeStudioStitchValue } from "./deepFreezeStudioStitchValue";

export function planStudioStitchBatchReviewSubset(
  input: StudioStitchBatchReviewPlanInput,
): StudioStitchBatchReviewPlanV1 {
  if (
    !Array.isArray(input.recipes) ||
    input.recipes.length < 1 ||
    input.recipes.length > 500
  ) {
    throw new Error("Batch review planning requires 1 through 500 recipes.");
  }
  input.recipes.forEach(assertStudioStitchRecipeV1);
  const recipesById = new Map<string, StudioStitchRecipeV1>();
  for (const recipe of input.recipes) {
    if (recipesById.has(recipe.id)) {
      throw new Error("Batch recipe IDs must be unique.");
    }
    recipesById.set(recipe.id, recipe);
  }
  const requestedCount =
    input.requestedCount ?? Math.min(5, input.recipes.length);
  if (
    !Number.isInteger(requestedCount) ||
    requestedCount < 1 ||
    requestedCount > input.recipes.length
  ) {
    throw new Error("Requested review count must fit inside the batch.");
  }
  const groups = new Map<string, StudioStitchRecipeV1[]>();
  for (const recipe of input.recipes) {
    const key = `${recipe.pipeline}:${recipe.hook.family}`;
    const group = groups.get(key) ?? [];
    group.push(recipe);
    groups.set(key, group);
  }
  const orderedGroups = [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, recipes]) => ({
      key,
      recipes: recipes.slice().sort((left, right) => left.id.localeCompare(right.id)),
    }));
  const selected: StudioStitchRecipeV1[] = [];
  for (const group of orderedGroups) {
    if (selected.length >= requestedCount) {
      break;
    }
    selected.push(group.recipes[0]);
  }
  if (selected.length < requestedCount) {
    const selectedIds = new Set(selected.map((recipe) => recipe.id));
    const remaining = input.recipes
      .filter((recipe) => !selectedIds.has(recipe.id))
      .sort((left, right) => left.id.localeCompare(right.id));
    selected.push(...remaining.slice(0, requestedCount - selected.length));
  }
  const selectedRecipeIds = selected.map((recipe) => recipe.id);
  const selectedIdSet = new Set(selectedRecipeIds);
  const remainingRecipeIds = input.recipes
    .map((recipe) => recipe.id)
    .filter((id) => !selectedIdSet.has(id))
    .sort((left, right) => left.localeCompare(right));
  const coverageKeys = [...new Set(
    selected.map((recipe) => `${recipe.pipeline}:${recipe.hook.family}`),
  )];
  return deepFreezeStudioStitchValue({
    planVersion: 1,
    strategy: "hookFamilyCoverageThenRecipeId",
    requestedCount,
    totalCount: input.recipes.length,
    selectedRecipeIds,
    remainingRecipeIds,
    coverageKeys,
  }) as StudioStitchBatchReviewPlanV1;
}
