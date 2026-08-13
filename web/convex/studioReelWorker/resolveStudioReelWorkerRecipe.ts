import type { StudioReelWorkerClaimRecipe } from "../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimRecipe";
import type { StudioStitchAssetRef } from "../../lib/clipstitchr/types/studioStitch/StudioStitchAssetRef";
import { parseStudioStitchRecipe } from "../../lib/clipstitchr/studio/stitch/parseStudioStitchRecipe";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { resolveStudioReelWorkerAsset } from "./resolveStudioReelWorkerAsset";

export async function resolveStudioReelWorkerRecipe(
  ctx: MutationCtx | QueryCtx,
  input: {
    ownerId: string;
    productId: string;
    recipeId: string;
  },
): Promise<StudioReelWorkerClaimRecipe> {
  const document = await ctx.db
    .query("studioReelRecipes")
    .withIndex("by_owner_product_id", (query) =>
      query
        .eq("ownerId", input.ownerId)
        .eq("productId", input.productId)
        .eq("id", input.recipeId),
    )
    .unique();
  if (!document || document.status !== "active") {
    throw new Error("Studio Stitch run recipe is no longer active.");
  }
  const recipe = parseStudioStitchRecipe(document.recipeJson);
  if (
    recipe.id !== document.id ||
    recipe.productId !== input.productId ||
    recipe.pipeline !== document.pipeline
  ) {
    throw new Error("Studio Stitch run recipe scope is invalid.");
  }
  const sources: StudioStitchAssetRef[] = [];
  const reactionFromProvider = recipe.providerRequirements.some(
    (requirement) =>
      requirement.capability === "reactionFootage" &&
      !requirement.satisfiedByInput,
  );
  const reactionRoles = new Set([
    "reactionHook",
    "reactionContext",
    "reactionBridge",
    "reactionSupport",
    "ctaReaction",
  ]);
  for (const source of [
    ...recipe.segments
      .filter(
        (segment) =>
          !reactionFromProvider || !reactionRoles.has(segment.role),
      )
      .map((segment) => segment.source),
    ...(recipe.music.source ? [recipe.music.source] : []),
  ]) {
    const identity = JSON.stringify(source);
    if (!sources.some((candidate) => JSON.stringify(candidate) === identity)) {
      sources.push(source);
    }
  }
  const assets = [];
  for (const source of sources) {
    assets.push(
      await resolveStudioReelWorkerAsset(ctx, {
        ownerId: input.ownerId,
        productId: input.productId,
        source,
      }),
    );
  }
  return {
    id: document.id,
    pipeline: document.pipeline,
    recipeJson: document.recipeJson,
    assets,
  };
}
