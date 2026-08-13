import { parseStudioStitchRecipe } from "../../lib/clipstitchr/studio/stitch/parseStudioStitchRecipe";
import { serializeStudioStitchRecipe } from "../../lib/clipstitchr/studio/stitch/serializeStudioStitchRecipe";
import { STUDIO_STITCH_RECIPE_SNAPSHOT_MAX_BYTES } from "../../lib/clipstitchr/studio/stitch/studioStitchRecipeSnapshotMaxBytes";
import { getStudioReelUtf8ByteLength } from "./getStudioReelUtf8ByteLength";

export function normalizeStudioReelRecipeSnapshot(
  recipeJson: string,
  expected: {
    readonly id: string;
    readonly productId: string;
    readonly pipeline: "classicReel" | "talkingVideo";
  },
) {
  if (
    typeof recipeJson !== "string" ||
    getStudioReelUtf8ByteLength(recipeJson) >
      STUDIO_STITCH_RECIPE_SNAPSHOT_MAX_BYTES
  ) {
    throw new Error("Studio Stitch recipe exceeds the 256 KiB snapshot limit.");
  }
  const recipe = parseStudioStitchRecipe(recipeJson);
  if (
    recipe.id !== expected.id ||
    recipe.productId !== expected.productId ||
    recipe.pipeline !== expected.pipeline
  ) {
    throw new Error("Recipe identity does not match its durable record.");
  }
  const normalizedJson = serializeStudioStitchRecipe(recipe);

  return {
    recipe,
    recipeJson: normalizedJson,
    byteLength: getStudioReelUtf8ByteLength(normalizedJson),
  };
}
