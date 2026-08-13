import type { MutationCtx } from "../_generated/server";
import { getStudioReelRecipeForOwnerProduct } from "./getStudioReelRecipeForOwnerProduct";

export async function getStudioReelRecipesForOwnerProduct(
  ctx: MutationCtx,
  ownerId: string,
  productId: string,
  recipeIds: readonly string[],
) {
  const recipes = await Promise.all(
    recipeIds.map((recipeId) =>
      getStudioReelRecipeForOwnerProduct(ctx, ownerId, productId, recipeId),
    ),
  );
  if (recipes.some((recipe) => !recipe || recipe.status !== "active")) {
    throw new Error("Every requested recipe must be active and owned by this Product.");
  }

  return recipes.filter((recipe) => recipe !== null);
}
