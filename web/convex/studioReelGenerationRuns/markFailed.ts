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

export const markFailed = internalMutation({
  args: {
    id: v.string(),
    productId: v.string(),
    expectedRevision: v.number(),
    failureCode: v.string(),
    failureMessage: v.string(),
    retryable: v.boolean(),
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
    const failureCode = assertStudioReelBoundedString(args.failureCode, {
      label: "Failure code",
      maxLength: 80,
    });
    const failureMessage = assertStudioReelBoundedString(args.failureMessage, {
      label: "Failure message",
      maxLength: 1_000,
    });
    const idempotencyKey = assertStudioReelBoundedString(args.idempotencyKey, {
      label: "Idempotency key",
      maxLength: 200,
    });
    const requestFingerprint = await createStudioReelRequestFingerprint(
      JSON.stringify({
        operation: "failRun",
        id,
        productId,
        expectedRevision,
        failureCode,
        failureMessage,
        retryable: args.retryable,
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
        operation: "failRun",
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
      throw new Error("Only intent-ready generation runs can fail execution.");
    }

    await consumeStudioReelRecordWriteRateLimits(ctx, ownerId);
    const now = new Date().toISOString();
    const fields = {
      status: "failed" as const,
      revision: run.revision + 1,
      failureCode,
      failureMessage,
      failureRetryable: args.retryable,
      failedAt: now,
      updatedAt: now,
    };
    await ctx.db.patch(run._id, fields);
    await createStudioReelWriteReceipt(ctx, {
      ownerId,
      productId,
      idempotencyKey,
      operation: "failRun",
      targetId: id,
      requestFingerprint,
      createdAt: now,
    });
    return { changed: true, run: { ...run, ...fields } };
  },
});
