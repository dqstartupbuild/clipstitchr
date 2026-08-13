import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertStudioReelBoundedString } from "../studioReel/assertStudioReelBoundedString";
import { assertStudioReelMatchingWriteReceipt } from "../studioReel/assertStudioReelMatchingWriteReceipt";
import { buildStudioReelProviderIntents } from "../studioReel/buildStudioReelProviderIntents";
import { consumeStudioReelProviderIntentListRateLimits } from "../studioReel/consumeStudioReelProviderIntentListRateLimits";
import { consumeStudioReelRecordWriteRateLimits } from "../studioReel/consumeStudioReelRecordWriteRateLimits";
import { createStudioReelRequestFingerprint } from "../studioReel/createStudioReelRequestFingerprint";
import { createStudioReelWriteReceipt } from "../studioReel/createStudioReelWriteReceipt";
import { getStudioReelAuthenticatedScope } from "../studioReel/getStudioReelAuthenticatedScope";
import { getStudioReelRecipesForOwnerProduct } from "../studioReel/getStudioReelRecipesForOwnerProduct";
import { getStudioReelReviewSubsetForOwnerProduct } from "../studioReel/getStudioReelReviewSubsetForOwnerProduct";
import { getStudioReelRunForOwnerProduct } from "../studioReel/getStudioReelRunForOwnerProduct";
import { getStudioReelRunStatusFromIntents } from "../studioReel/getStudioReelRunStatusFromIntents";
import { getStudioReelWriteReceipt } from "../studioReel/getStudioReelWriteReceipt";
import { normalizeStudioReelProviderReadiness } from "../studioReel/normalizeStudioReelProviderReadiness";
import { parseStudioReelRecipeDocuments } from "../studioReel/parseStudioReelRecipeDocuments";
import { studioReelProviderReadinessValidator } from "../validators/studioReelProviderReadiness";

export const createRemainingIntent = mutation({
  args: {
    id: v.string(),
    parentRunId: v.string(),
    productId: v.string(),
    providerReadiness: v.array(studioReelProviderReadinessValidator),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    const { ownerId, productId } = await getStudioReelAuthenticatedScope(
      ctx,
      args.productId,
    );
    const id = assertStudioReelBoundedString(args.id, {
      label: "Remaining generation run ID",
      maxLength: 120,
    });
    const parentRunId = assertStudioReelBoundedString(args.parentRunId, {
      label: "Parent generation run ID",
      maxLength: 120,
    });
    const providerReadiness = normalizeStudioReelProviderReadiness(
      args.providerReadiness,
    );
    const idempotencyKey = assertStudioReelBoundedString(args.idempotencyKey, {
      label: "Idempotency key",
      maxLength: 200,
    });
    const requestFingerprint = await createStudioReelRequestFingerprint(
      JSON.stringify({
        operation: "createRemainingRun",
        id,
        parentRunId,
        productId,
        providerReadiness,
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
        operation: "createRemainingRun",
        requestFingerprint,
      });
      const run = await getStudioReelRunForOwnerProduct(
        ctx,
        ownerId,
        productId,
        receipt.targetId,
      );
      if (!run) throw new Error("Idempotent remaining run is unavailable.");
      return { created: false, run };
    }
    const parentRun = await getStudioReelRunForOwnerProduct(
      ctx,
      ownerId,
      productId,
      parentRunId,
    );
    if (!parentRun || parentRun.kind !== "sample") {
      throw new Error("Sample generation run not found.");
    }
    if (parentRun.status !== "completed") {
      throw new Error("Sample generation run must be completed first.");
    }
    if (!parentRun.reviewSubsetId) {
      throw new Error("Sample generation run has no review subset.");
    }
    const reviewSubset = await getStudioReelReviewSubsetForOwnerProduct(
      ctx,
      ownerId,
      productId,
      parentRun.reviewSubsetId,
    );
    if (!reviewSubset || reviewSubset.status !== "approved") {
      throw new Error("Approve the sample review subset first.");
    }
    if (reviewSubset.remainingRecipeIds.length === 0) {
      throw new Error("This batch has no remaining recipes.");
    }
    const [existingById, existingForParent] = await Promise.all([
      getStudioReelRunForOwnerProduct(ctx, ownerId, productId, id),
      ctx.db
        .query("studioReelGenerationRuns")
        .withIndex("by_owner_product_parent", (query) =>
          query
            .eq("ownerId", ownerId)
            .eq("productId", productId)
            .eq("parentRunId", parentRunId),
        )
        .unique(),
    ]);
    if (existingById || existingForParent) {
      throw new Error("A remaining generation run already exists.");
    }
    const recipeDocuments = await getStudioReelRecipesForOwnerProduct(
      ctx,
      ownerId,
      productId,
      reviewSubset.remainingRecipeIds,
    );
    const providerIntents = buildStudioReelProviderIntents(
      parseStudioReelRecipeDocuments(recipeDocuments),
      providerReadiness,
    );

    await consumeStudioReelRecordWriteRateLimits(ctx, ownerId);
    await consumeStudioReelProviderIntentListRateLimits(
      ctx,
      ownerId,
      providerIntents,
    );
    const now = new Date().toISOString();
    const documentId = await ctx.db.insert("studioReelGenerationRuns", {
      ownerId,
      id,
      productId,
      kind: "remaining",
      parentRunId,
      status: getStudioReelRunStatusFromIntents(providerIntents),
      recordVersion: 1,
      revision: 1,
      recipeIds: reviewSubset.remainingRecipeIds,
      requestedCount: reviewSubset.remainingRecipeIds.length,
      providerReadiness,
      providerIntents,
      idempotencyKey,
      attempt: 1,
      createdAt: now,
      updatedAt: now,
    });
    await createStudioReelWriteReceipt(ctx, {
      ownerId,
      productId,
      idempotencyKey,
      operation: "createRemainingRun",
      targetId: id,
      requestFingerprint,
      createdAt: now,
    });
    const run = await ctx.db.get(documentId);
    if (!run) throw new Error("Remaining generation run could not be read.");
    return { created: true, run };
  },
});
