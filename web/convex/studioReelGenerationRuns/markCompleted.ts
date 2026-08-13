import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { assertStudioReelBoundedString } from "../studioReel/assertStudioReelBoundedString";
import { assertStudioReelMatchingWriteReceipt } from "../studioReel/assertStudioReelMatchingWriteReceipt";
import { assertStudioReelPositiveInteger } from "../studioReel/assertStudioReelPositiveInteger";
import { consumeStudioReelRecordWriteRateLimits } from "../studioReel/consumeStudioReelRecordWriteRateLimits";
import { createStudioReelRequestFingerprint } from "../studioReel/createStudioReelRequestFingerprint";
import { createStudioReelWriteReceipt } from "../studioReel/createStudioReelWriteReceipt";
import { getStudioReelAuthenticatedScope } from "../studioReel/getStudioReelAuthenticatedScope";
import { getStudioReelRunForOwnerProduct } from "../studioReel/getStudioReelRunForOwnerProduct";
import { getStudioReelWriteReceipt } from "../studioReel/getStudioReelWriteReceipt";

export const markCompleted = internalMutation({
  args: {
    id: v.string(),
    productId: v.string(),
    expectedRevision: v.number(),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    const { ownerId, productId } = await getStudioReelAuthenticatedScope(
      ctx,
      args.productId,
    );
    const id = assertStudioReelBoundedString(args.id, {
      label: "Generation run ID",
      maxLength: 120,
    });
    const expectedRevision = assertStudioReelPositiveInteger(
      args.expectedRevision,
      "Expected revision",
      Number.MAX_SAFE_INTEGER,
    );
    const idempotencyKey = assertStudioReelBoundedString(args.idempotencyKey, {
      label: "Idempotency key",
      maxLength: 200,
    });
    const requestFingerprint = await createStudioReelRequestFingerprint(
      JSON.stringify({ operation: "completeRun", id, productId, expectedRevision }),
    );
    const receipt = await getStudioReelWriteReceipt(
      ctx,
      ownerId,
      idempotencyKey,
    );
    if (receipt) {
      assertStudioReelMatchingWriteReceipt(receipt, {
        productId,
        operation: "completeRun",
        requestFingerprint,
      });
      const run = await getStudioReelRunForOwnerProduct(
        ctx,
        ownerId,
        productId,
        receipt.targetId,
      );
      if (!run) throw new Error("Idempotent generation run is unavailable.");
      return { changed: false, run };
    }
    const run = await getStudioReelRunForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );
    if (!run) throw new Error("Generation run not found.");
    if (run.revision !== expectedRevision) {
      throw new Error(
        `Generation run revision conflict: expected ${expectedRevision}, current ${run.revision}.`,
      );
    }
    if (run.status !== "intentReady") {
      throw new Error("Only intent-ready generation runs can be completed.");
    }
    const outputs = await ctx.db
      .query("studioReelOutputs")
      .withIndex("by_owner_product_run_created", (query) =>
        query
          .eq("ownerId", ownerId)
          .eq("productId", productId)
          .eq("generationRunId", id),
      )
      .collect();
    const outputRecipeIds = new Set(outputs.map((output) => output.recipeId));
    if (run.recipeIds.some((recipeId) => !outputRecipeIds.has(recipeId))) {
      throw new Error("Every run recipe must have a generated output before completion.");
    }

    await consumeStudioReelRecordWriteRateLimits(ctx, ownerId);
    const now = new Date().toISOString();
    const fields = {
      status: "completed" as const,
      revision: run.revision + 1,
      completedAt: now,
      updatedAt: now,
    };
    await ctx.db.patch(run._id, fields);
    await createStudioReelWriteReceipt(ctx, {
      ownerId,
      productId,
      idempotencyKey,
      operation: "completeRun",
      targetId: id,
      requestFingerprint,
      createdAt: now,
    });
    return { changed: true, run: { ...run, ...fields } };
  },
});
