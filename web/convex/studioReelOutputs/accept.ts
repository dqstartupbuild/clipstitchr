import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertStudioReelBoundedString } from "../studioReel/assertStudioReelBoundedString";
import { assertStudioReelHandoffOwnership } from "../studioReel/assertStudioReelHandoffOwnership";
import { assertStudioReelMatchingWriteReceipt } from "../studioReel/assertStudioReelMatchingWriteReceipt";
import { assertStudioReelPositiveInteger } from "../studioReel/assertStudioReelPositiveInteger";
import { consumeStudioReelRecordWriteRateLimits } from "../studioReel/consumeStudioReelRecordWriteRateLimits";
import { createStudioReelRequestFingerprint } from "../studioReel/createStudioReelRequestFingerprint";
import { createStudioReelWriteReceipt } from "../studioReel/createStudioReelWriteReceipt";
import { getStudioReelAuthenticatedScope } from "../studioReel/getStudioReelAuthenticatedScope";
import { getStudioReelOutputForOwnerProduct } from "../studioReel/getStudioReelOutputForOwnerProduct";
import { getStudioReelWriteReceipt } from "../studioReel/getStudioReelWriteReceipt";
import { normalizeStudioReelHandoffMetadata } from "../studioReel/normalizeStudioReelHandoffMetadata";
import { studioReelHandoffMetadataValidator } from "../validators/studioReelHandoffMetadata";

export const accept = mutation({
  args: {
    id: v.string(),
    productId: v.string(),
    expectedRevision: v.number(),
    handoff: studioReelHandoffMetadataValidator,
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
    const expectedRevision = assertStudioReelPositiveInteger(
      args.expectedRevision,
      "Expected revision",
      Number.MAX_SAFE_INTEGER,
    );
    const handoff = normalizeStudioReelHandoffMetadata(args.handoff);
    const idempotencyKey = assertStudioReelBoundedString(args.idempotencyKey, {
      label: "Idempotency key",
      maxLength: 200,
    });
    const requestFingerprint = await createStudioReelRequestFingerprint(
      JSON.stringify({
        operation: "acceptOutput",
        id,
        productId,
        expectedRevision,
        handoff,
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
        operation: "acceptOutput",
        requestFingerprint,
      });
      const output = await getStudioReelOutputForOwnerProduct(
        ctx,
        ownerId,
        productId,
        receipt.targetId,
      );
      if (!output) throw new Error("Idempotent output is unavailable.");
      return { changed: false, output };
    }
    const output = await getStudioReelOutputForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );
    if (!output) throw new Error("Studio Stitch output not found.");
    if (output.revision !== expectedRevision) {
      throw new Error(
        `Output revision conflict: expected ${expectedRevision}, current ${output.revision}.`,
      );
    }
    if (output.status !== "generated") {
      throw new Error("Only generated outputs can be accepted.");
    }
    await assertStudioReelHandoffOwnership(ctx, {
      ownerId,
      productId,
      libraryAssetId: handoff.libraryAssetId,
      editorProjectId: handoff.editorProjectId,
    });

    await consumeStudioReelRecordWriteRateLimits(ctx, ownerId);
    const now = new Date().toISOString();
    const fields = {
      status: "accepted" as const,
      revision: output.revision + 1,
      handoff,
      acceptedAt: now,
      updatedAt: now,
    };
    await ctx.db.patch(output._id, fields);
    await createStudioReelWriteReceipt(ctx, {
      ownerId,
      productId,
      idempotencyKey,
      operation: "acceptOutput",
      targetId: id,
      requestFingerprint,
      createdAt: now,
    });
    return { changed: true, output: { ...output, ...fields } };
  },
});
