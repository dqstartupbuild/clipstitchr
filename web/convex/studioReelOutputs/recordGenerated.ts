import { v } from "convex/values";
import { parseStudioStitchRecipe } from "../../lib/clipstitchr/studio/stitch/parseStudioStitchRecipe";
import { internalMutation } from "../_generated/server";
import { assertStudioReelBoundedString } from "../studioReel/assertStudioReelBoundedString";
import { assertStudioReelMatchingWriteReceipt } from "../studioReel/assertStudioReelMatchingWriteReceipt";
import { assertStudioReelOutputObjectKey } from "../studioReel/assertStudioReelOutputObjectKey";
import { consumeStudioReelRecordWriteRateLimits } from "../studioReel/consumeStudioReelRecordWriteRateLimits";
import { createStudioReelRequestFingerprint } from "../studioReel/createStudioReelRequestFingerprint";
import { createStudioReelWriteReceipt } from "../studioReel/createStudioReelWriteReceipt";
import { getStudioReelAuthenticatedScope } from "../studioReel/getStudioReelAuthenticatedScope";
import { getStudioReelOutputForOwnerProduct } from "../studioReel/getStudioReelOutputForOwnerProduct";
import { getStudioReelRecipeForOwnerProduct } from "../studioReel/getStudioReelRecipeForOwnerProduct";
import { getStudioReelRunForOwnerProduct } from "../studioReel/getStudioReelRunForOwnerProduct";
import { getStudioReelWriteReceipt } from "../studioReel/getStudioReelWriteReceipt";

export const recordGenerated = internalMutation({
  args: {
    id: v.string(),
    productId: v.string(),
    generationRunId: v.string(),
    recipeId: v.string(),
    objectKey: v.string(),
    contentType: v.string(),
    byteLength: v.number(),
    durationSeconds: v.number(),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    const { ownerId, productId } = await getStudioReelAuthenticatedScope(
      ctx,
      args.productId,
    );
    const id = assertStudioReelBoundedString(args.id, {
      label: "Studio Stitch output ID",
      maxLength: 120,
    });
    const generationRunId = assertStudioReelBoundedString(args.generationRunId, {
      label: "Generation run ID",
      maxLength: 120,
    });
    const recipeId = assertStudioReelBoundedString(args.recipeId, {
      label: "Recipe ID",
      maxLength: 120,
    });
    const objectKey = assertStudioReelOutputObjectKey(args.objectKey, ownerId);
    if (args.contentType !== "video/mp4") {
      throw new Error("Studio Stitch outputs must be video/mp4.");
    }
    if (
      !Number.isInteger(args.byteLength) ||
      args.byteLength < 1 ||
      args.byteLength > 2 * 1024 * 1024 * 1024
    ) {
      throw new Error("Output byte length must be between 1 byte and 2 GiB.");
    }
    if (
      !Number.isFinite(args.durationSeconds) ||
      args.durationSeconds < 7 ||
      args.durationSeconds > 30.25
    ) {
      throw new Error("Output duration is outside the Studio Stitch range.");
    }
    const idempotencyKey = assertStudioReelBoundedString(args.idempotencyKey, {
      label: "Idempotency key",
      maxLength: 200,
    });
    const requestFingerprint = await createStudioReelRequestFingerprint(
      JSON.stringify({
        operation: "recordOutput",
        id,
        productId,
        generationRunId,
        recipeId,
        objectKey,
        contentType: args.contentType,
        byteLength: args.byteLength,
        durationSeconds: args.durationSeconds,
      }),
    );
    const receipt = await getStudioReelWriteReceipt(
      ctx,
      ownerId,
      idempotencyKey,
    );
    if (receipt) {
      assertStudioReelMatchingWriteReceipt(receipt, {
        productId,
        operation: "recordOutput",
        requestFingerprint,
      });
      const output = await getStudioReelOutputForOwnerProduct(
        ctx,
        ownerId,
        productId,
        receipt.targetId,
      );
      if (!output) throw new Error("Idempotent output is unavailable.");
      return { created: false, output };
    }
    const [existing, run, recipeDocument] = await Promise.all([
      getStudioReelOutputForOwnerProduct(ctx, ownerId, productId, id),
      getStudioReelRunForOwnerProduct(
        ctx,
        ownerId,
        productId,
        generationRunId,
      ),
      getStudioReelRecipeForOwnerProduct(ctx, ownerId, productId, recipeId),
    ]);
    if (existing) throw new Error("Studio Stitch output ID already exists.");
    if (!run || !["intentReady", "completed"].includes(run.status)) {
      throw new Error("Generation run is not ready to receive outputs.");
    }
    if (!run.recipeIds.includes(recipeId)) {
      throw new Error("Output recipe does not belong to this generation run.");
    }
    if (!recipeDocument) throw new Error("Output recipe not found.");
    const recipe = parseStudioStitchRecipe(recipeDocument.recipeJson);
    if (Math.abs(recipe.durationSeconds - args.durationSeconds) > 0.25) {
      throw new Error("Output duration does not match its recipe.");
    }

    await consumeStudioReelRecordWriteRateLimits(ctx, ownerId);
    const now = new Date().toISOString();
    const documentId = await ctx.db.insert("studioReelOutputs", {
      ownerId,
      id,
      productId,
      generationRunId,
      recipeId,
      status: "generated",
      recordVersion: 1,
      revision: 1,
      objectKey,
      contentType: args.contentType,
      byteLength: args.byteLength,
      durationSeconds: args.durationSeconds,
      idempotencyKey,
      createdAt: now,
      updatedAt: now,
    });
    await createStudioReelWriteReceipt(ctx, {
      ownerId,
      productId,
      idempotencyKey,
      operation: "recordOutput",
      targetId: id,
      requestFingerprint,
      createdAt: now,
    });
    const output = await ctx.db.get(documentId);
    if (!output) throw new Error("Output could not be read after creation.");
    return { created: true, output };
  },
});
