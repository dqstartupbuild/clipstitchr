import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { consumeStudioReelRecordWriteRateLimits } from "../studioReel/consumeStudioReelRecordWriteRateLimits";
import { createStudioReelRequestFingerprint } from "../studioReel/createStudioReelRequestFingerprint";
import { createStudioReelWriteReceipt } from "../studioReel/createStudioReelWriteReceipt";
import { getStudioReelAuthenticatedScope } from "../studioReel/getStudioReelAuthenticatedScope";
import { getStudioReelRecipeForOwnerProduct } from "../studioReel/getStudioReelRecipeForOwnerProduct";
import { getStudioReelWriteReceipt } from "../studioReel/getStudioReelWriteReceipt";
import { assertStudioReelBoundedString } from "../studioReel/assertStudioReelBoundedString";
import { assertStudioReelMatchingWriteReceipt } from "../studioReel/assertStudioReelMatchingWriteReceipt";
import { normalizeStudioReelRecipeSnapshot } from "../studioReel/normalizeStudioReelRecipeSnapshot";
import { studioReelPipelineValidator } from "../validators/studioReelPipeline";

export const create = mutation({
  args: {
    id: v.string(),
    productId: v.string(),
    pipeline: studioReelPipelineValidator,
    recipeJson: v.string(),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    const { ownerId, productId } = await getStudioReelAuthenticatedScope(
      ctx,
      args.productId,
    );
    const id = assertStudioReelBoundedString(args.id, {
      label: "Studio Stitch recipe ID",
      maxLength: 120,
    });
    const idempotencyKey = assertStudioReelBoundedString(args.idempotencyKey, {
      label: "Idempotency key",
      maxLength: 200,
    });
    const snapshot = normalizeStudioReelRecipeSnapshot(args.recipeJson, {
      id,
      productId,
      pipeline: args.pipeline,
    });
    const requestFingerprint = await createStudioReelRequestFingerprint(
      JSON.stringify({
        operation: "createRecipe",
        id,
        productId,
        pipeline: args.pipeline,
        recipeJson: snapshot.recipeJson,
      }),
    );
    const [receipt, existing] = await Promise.all([
      getStudioReelWriteReceipt(ctx, ownerId, idempotencyKey),
      getStudioReelRecipeForOwnerProduct(ctx, ownerId, productId, id),
    ]);
    if (receipt) {
      assertStudioReelMatchingWriteReceipt(receipt, {
        productId,
        operation: "createRecipe",
        requestFingerprint,
      });
      const recipe = await getStudioReelRecipeForOwnerProduct(
        ctx,
        ownerId,
        productId,
        receipt.targetId,
      );
      if (!recipe) throw new Error("Idempotent recipe record is unavailable.");
      return { created: false, recipe };
    }
    if (existing) {
      throw new Error("Studio Stitch recipe ID already exists.");
    }

    await consumeStudioReelRecordWriteRateLimits(ctx, ownerId);
    const now = new Date().toISOString();
    const documentId = await ctx.db.insert("studioReelRecipes", {
      ownerId,
      id,
      productId,
      pipeline: args.pipeline,
      status: "active",
      recordVersion: 1,
      revision: 1,
      recipeVersion: snapshot.recipe.recipeVersion,
      recipeJson: snapshot.recipeJson,
      recipeByteLength: snapshot.byteLength,
      createdAt: now,
      updatedAt: now,
    });
    await createStudioReelWriteReceipt(ctx, {
      ownerId,
      productId,
      idempotencyKey,
      operation: "createRecipe",
      targetId: id,
      requestFingerprint,
      createdAt: now,
    });
    const recipe = await ctx.db.get(documentId);
    if (!recipe) throw new Error("Recipe could not be read after creation.");
    return { created: true, recipe };
  },
});
