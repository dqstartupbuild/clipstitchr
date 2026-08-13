import type { StudioStitchRecipeV1 } from "../../types/studioStitch/StudioStitchRecipeV1";
import { assertStudioStitchRecipeV1 } from "./assertStudioStitchRecipeV1";
import { deepFreezeStudioStitchValue } from "./deepFreezeStudioStitchValue";

export function finalizeStudioStitchRecipe<T extends StudioStitchRecipeV1>(
  recipe: T,
): T {
  assertStudioStitchRecipeV1(recipe);
  return deepFreezeStudioStitchValue(recipe) as T;
}
