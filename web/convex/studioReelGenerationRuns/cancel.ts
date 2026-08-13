import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertStudioReelBoundedString } from "../studioReel/assertStudioReelBoundedString";
import { assertStudioReelMatchingWriteReceipt } from "../studioReel/assertStudioReelMatchingWriteReceipt";
import { assertStudioReelPositiveInteger } from "../studioReel/assertStudioReelPositiveInteger";
import { consumeStudioReelRecordWriteRateLimits } from "../studioReel/consumeStudioReelRecordWriteRateLimits";
import { createStudioReelRequestFingerprint } from "../studioReel/createStudioReelRequestFingerprint";
import { createStudioReelWriteReceipt } from "../studioReel/createStudioReelWriteReceipt";
import { getStudioReelAuthenticatedScope } from "../studioReel/getStudioReelAuthenticatedScope";
import { getStudioReelRunForOwnerProduct } from "../studioReel/getStudioReelRunForOwnerProduct";
import { getStudioReelWriteReceipt } from "../studioReel/getStudioReelWriteReceipt";

export const cancel = mutation({
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
      JSON.stringify({ operation: "cancelRun", id, productId, expectedRevision }),
    );
    const receipt = await getStudioReelWriteReceipt(
      ctx,
      ownerId,
      idempotencyKey,
    );
    if (receipt) {
      assertStudioReelMatchingWriteReceipt(receipt, {
        productId,
        operation: "cancelRun",
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
    if (run.status === "completed" || run.status === "canceled") {
      throw new Error("Generation run cannot be canceled from its current state.");
    }

    await consumeStudioReelRecordWriteRateLimits(ctx, ownerId);
    const now = new Date().toISOString();
    const fields = {
      status: "canceled" as const,
      revision: run.revision + 1,
      cancelRequestedAt: now,
      canceledAt: now,
      updatedAt: now,
    };
    await ctx.db.patch(run._id, fields);
    await createStudioReelWriteReceipt(ctx, {
      ownerId,
      productId,
      idempotencyKey,
      operation: "cancelRun",
      targetId: id,
      requestFingerprint,
      createdAt: now,
    });
    return { changed: true, run: { ...run, ...fields } };
  },
});
