import type { StudioStitchRecipeV1 } from "../../types/studioStitch/StudioStitchRecipeV1";
import { assertStudioStitchRecipeV1 } from "./assertStudioStitchRecipeV1";
import { canonicalizeStudioStitchJsonValue } from "./canonicalizeStudioStitchJsonValue";

export function serializeStudioStitchRecipe(
  recipe: StudioStitchRecipeV1,
): string {
  assertStudioStitchRecipeV1(recipe);
  return JSON.stringify(canonicalizeStudioStitchJsonValue(recipe));
}
