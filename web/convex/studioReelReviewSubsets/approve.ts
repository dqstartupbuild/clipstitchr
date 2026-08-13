import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertStudioReelBoundedString } from "../studioReel/assertStudioReelBoundedString";
import { assertStudioReelMatchingWriteReceipt } from "../studioReel/assertStudioReelMatchingWriteReceipt";
import { assertStudioReelPositiveInteger } from "../studioReel/assertStudioReelPositiveInteger";
import { consumeStudioReelRecordWriteRateLimits } from "../studioReel/consumeStudioReelRecordWriteRateLimits";
import { createStudioReelRequestFingerprint } from "../studioReel/createStudioReelRequestFingerprint";
import { createStudioReelWriteReceipt } from "../studioReel/createStudioReelWriteReceipt";
import { getStudioReelAuthenticatedScope } from "../studioReel/getStudioReelAuthenticatedScope";
import { getStudioReelOutputForOwnerProduct } from "../studioReel/getStudioReelOutputForOwnerProduct";
import { getStudioReelReviewSubsetForOwnerProduct } from "../studioReel/getStudioReelReviewSubsetForOwnerProduct";
import { getStudioReelRunForOwnerProduct } from "../studioReel/getStudioReelRunForOwnerProduct";
import { getStudioReelWriteReceipt } from "../studioReel/getStudioReelWriteReceipt";
import { normalizeStudioReelIdentifierList } from "../studioReel/normalizeStudioReelIdentifierList";

export const approve = mutation({
  args: {
    id: v.string(),
    productId: v.string(),
    approvedOutputIds: v.array(v.string()),
    expectedRevision: v.number(),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    const { ownerId, productId } = await getStudioReelAuthenticatedScope(
      ctx,
      args.productId,
    );
    const id = assertStudioReelBoundedString(args.id, {
      label: "Review subset ID",
      maxLength: 120,
    });
    const approvedOutputIds = normalizeStudioReelIdentifierList(
      args.approvedOutputIds,
      { label: "Approved output IDs", maximumCount: 100 },
    );
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
      JSON.stringify({
        operation: "approveReviewSubset",
        id,
        productId,
        approvedOutputIds,
        expectedRevision,
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
        operation: "approveReviewSubset",
        requestFingerprint,
      });
      const reviewSubset = await getStudioReelReviewSubsetForOwnerProduct(
        ctx,
        ownerId,
        productId,
        receipt.targetId,
      );
      if (!reviewSubset) throw new Error("Idempotent review subset is unavailable.");
      return { changed: false, reviewSubset };
    }
    const reviewSubset = await getStudioReelReviewSubsetForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );
    if (!reviewSubset) throw new Error("Review subset not found.");
    if (reviewSubset.revision !== expectedRevision) {
      throw new Error(
        `Review subset revision conflict: expected ${expectedRevision}, current ${reviewSubset.revision}.`,
      );
    }
    if (reviewSubset.status !== "pending") {
      throw new Error("Review subset is already approved.");
    }
    if (approvedOutputIds.length !== reviewSubset.selectedRecipeIds.length) {
      throw new Error("Approve exactly one output for every sample recipe.");
    }
    const run = await getStudioReelRunForOwnerProduct(
      ctx,
      ownerId,
      productId,
      reviewSubset.generationRunId,
    );
    if (!run || run.status !== "completed") {
      throw new Error("Sample generation run must be completed first.");
    }
    const outputs = await Promise.all(
      approvedOutputIds.map((outputId) =>
        getStudioReelOutputForOwnerProduct(
          ctx,
          ownerId,
          productId,
          outputId,
        ),
      ),
    );
    if (
      outputs.some(
        (output) =>
          !output ||
          output.status !== "accepted" ||
          output.generationRunId !== reviewSubset.generationRunId,
      )
    ) {
      throw new Error("Every approved output must be accepted from this sample run.");
    }
    const approvedRecipeIds = outputs
      .filter((output) => output !== null)
      .map((output) => output.recipeId)
      .sort();
    if (
      JSON.stringify(approvedRecipeIds) !==
      JSON.stringify([...reviewSubset.selectedRecipeIds].sort())
    ) {
      throw new Error("Approved outputs must cover every selected sample recipe once.");
    }

    await consumeStudioReelRecordWriteRateLimits(ctx, ownerId);
    const now = new Date().toISOString();
    const fields = {
      status: "approved" as const,
      revision: reviewSubset.revision + 1,
      approvedOutputIds,
      approvedAt: now,
      updatedAt: now,
    };
    await ctx.db.patch(reviewSubset._id, fields);
    await createStudioReelWriteReceipt(ctx, {
      ownerId,
      productId,
      idempotencyKey,
      operation: "approveReviewSubset",
      targetId: id,
      requestFingerprint,
      createdAt: now,
    });
    return { changed: true, reviewSubset: { ...reviewSubset, ...fields } };
  },
});
