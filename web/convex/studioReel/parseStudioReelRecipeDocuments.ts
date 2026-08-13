import { parseStudioStitchRecipe } from "../../lib/clipstitchr/studio/stitch/parseStudioStitchRecipe";

export function parseStudioReelRecipeDocuments(
  recipes: readonly { readonly recipeJson: string }[],
) {
  return recipes.map((recipe) => parseStudioStitchRecipe(recipe.recipeJson));
}
