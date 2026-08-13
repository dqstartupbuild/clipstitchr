import type { MutationCtx } from "../_generated/server";
import type { Infer } from "convex/values";
import { studioReelRecipeStatusValidator } from "../validators/studioReelRecipeStatus";
import { studioReelWriteOperationValidator } from "../validators/studioReelWriteOperation";
import { assertStudioReelMatchingWriteReceipt } from "../studioReel/assertStudioReelMatchingWriteReceipt";
import { consumeStudioReelRecordWriteRateLimits } from "../studioReel/consumeStudioReelRecordWriteRateLimits";
import { createStudioReelRequestFingerprint } from "../studioReel/createStudioReelRequestFingerprint";
import { createStudioReelWriteReceipt } from "../studioReel/createStudioReelWriteReceipt";
import { getStudioReelRecipeForOwnerProduct } from "../studioReel/getStudioReelRecipeForOwnerProduct";
import { getStudioReelWriteReceipt } from "../studioReel/getStudioReelWriteReceipt";

type RecipeStatus = Infer<typeof studioReelRecipeStatusValidator>;
type WriteOperation = Infer<typeof studioReelWriteOperationValidator>;

export async function changeStudioReelRecipeStatus(
  ctx: MutationCtx,
  args: {
    readonly ownerId: string;
    readonly productId: string;
    readonly recipeId: string;
    readonly expectedRevision: number;
    readonly idempotencyKey: string;
    readonly operation: WriteOperation;
    readonly fromStatus: RecipeStatus;
    readonly toStatus: RecipeStatus;
  },
) {
  const requestFingerprint = await createStudioReelRequestFingerprint(
    JSON.stringify({
      operation: args.operation,
      productId: args.productId,
      recipeId: args.recipeId,
      expectedRevision: args.expectedRevision,
      toStatus: args.toStatus,
    }),
  );
  const receipt = await getStudioReelWriteReceipt(
    ctx,
    args.ownerId,
    args.idempotencyKey,
  );
  if (receipt) {
    assertStudioReelMatchingWriteReceipt(receipt, {
      productId: args.productId,
      operation: args.operation,
      requestFingerprint,
    });
    const recipe = await getStudioReelRecipeForOwnerProduct(
      ctx,
      args.ownerId,
      args.productId,
      receipt.targetId,
    );
    if (!recipe) throw new Error("Idempotent recipe record is unavailable.");
    return { changed: false, recipe };
  }
  const recipe = await getStudioReelRecipeForOwnerProduct(
    ctx,
    args.ownerId,
    args.productId,
    args.recipeId,
  );
  if (!recipe) throw new Error("Studio Stitch recipe not found.");
  if (recipe.revision !== args.expectedRevision) {
    throw new Error(
      `Studio Stitch recipe revision conflict: expected ${args.expectedRevision}, current ${recipe.revision}.`,
    );
  }
  if (recipe.status !== args.fromStatus) {
    throw new Error(`Studio Stitch recipe must be ${args.fromStatus}.`);
  }

  await consumeStudioReelRecordWriteRateLimits(ctx, args.ownerId);
  const now = new Date().toISOString();
  const fields = {
    status: args.toStatus,
    revision: recipe.revision + 1,
    updatedAt: now,
    ...(args.toStatus === "archived"
      ? { archivedAt: now }
      : { archivedAt: undefined }),
  };
  await ctx.db.patch(recipe._id, fields);
  await createStudioReelWriteReceipt(ctx, {
    ownerId: args.ownerId,
    productId: args.productId,
    idempotencyKey: args.idempotencyKey,
    operation: args.operation,
    targetId: args.recipeId,
    requestFingerprint,
    createdAt: now,
  });

  return { changed: true, recipe: { ...recipe, ...fields } };
}
