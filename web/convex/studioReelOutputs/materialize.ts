import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { videoClipCounts, videoClipProductCounts } from "../aggregateCounts";
import { createNotification } from "../createNotification";
import { getVideoClipNotificationCopy } from "../getVideoClipNotificationCopy";
import { assertStudioReelBoundedString } from "../studioReel/assertStudioReelBoundedString";
import { assertStudioReelMatchingWriteReceipt } from "../studioReel/assertStudioReelMatchingWriteReceipt";
import { consumeStudioReelRecordWriteRateLimits } from "../studioReel/consumeStudioReelRecordWriteRateLimits";
import { createStudioReelRequestFingerprint } from "../studioReel/createStudioReelRequestFingerprint";
import { createStudioReelWriteReceipt } from "../studioReel/createStudioReelWriteReceipt";
import { getStudioReelAuthenticatedScope } from "../studioReel/getStudioReelAuthenticatedScope";
import { getStudioReelOutputForOwnerProduct } from "../studioReel/getStudioReelOutputForOwnerProduct";
import { getStudioReelWriteReceipt } from "../studioReel/getStudioReelWriteReceipt";
import { assertStudioReelWorkerSecret } from "../studioReelWorker/assertStudioReelWorkerSecret";
import { studioReelMaterializationProofValidator } from "../validators/studioReelMaterializationProof";
import { upsertVideoClipCard } from "../upsertVideoClipCard";
import { assertStudioReelMaterializationProof } from "./assertStudioReelMaterializationProof";
import { createStudioReelLibraryClipFields } from "./createStudioReelLibraryClipFields";
import { createStudioReelLibraryClipId } from "./createStudioReelLibraryClipId";
import { toStudioReelMaterializeResult } from "./toStudioReelMaterializeResult";

export const materialize = mutation({
  args: {
    id: v.string(),
    idempotencyKey: v.string(),
    productId: v.string(),
    proof: studioReelMaterializationProofValidator,
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    assertStudioReelWorkerSecret(args.secret);
    const { ownerId, productId } = await getStudioReelAuthenticatedScope(
      ctx,
      args.productId,
    );
    const id = assertStudioReelBoundedString(args.id, {
      label: "Studio Stitch output ID",
      maxLength: 120,
    });
    const idempotencyKey = assertStudioReelBoundedString(args.idempotencyKey, {
      label: "Idempotency key",
      maxLength: 200,
    });
    const output = await getStudioReelOutputForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );
    if (!output || !["generated", "accepted"].includes(output.status)) {
      throw new Error("Generated Studio Stitch output not found.");
    }
    assertStudioReelMaterializationProof(output, args.proof);

    const libraryClipId =
      output.handoff?.libraryAssetId ?? createStudioReelLibraryClipId(output.id);
    const requestFingerprint = await createStudioReelRequestFingerprint(
      JSON.stringify({
        id,
        libraryClipId,
        operation: "materializeOutput",
        productId,
        proof: args.proof,
      }),
    );
    const receipt = await getStudioReelWriteReceipt(
      ctx,
      ownerId,
      idempotencyKey,
    );
    if (receipt) {
      assertStudioReelMatchingWriteReceipt(receipt, {
        operation: "materializeOutput",
        productId,
        requestFingerprint,
      });
      const current = await getStudioReelOutputForOwnerProduct(
        ctx,
        ownerId,
        productId,
        id,
      );
      const currentLibraryClipId = current?.handoff?.libraryAssetId;
      if (!current || !currentLibraryClipId) {
        throw new Error("Studio Stitch materialization receipt has no saved output.");
      }
      return toStudioReelMaterializeResult({
        created: false,
        libraryClipId: currentLibraryClipId,
        outputId: current.id,
      });
    }
    if (output.handoff?.libraryAssetId) {
      return toStudioReelMaterializeResult({
        created: false,
        libraryClipId: output.handoff.libraryAssetId,
        outputId: output.id,
      });
    }

    const existingClip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (query) =>
        query.eq("ownerId", ownerId).eq("id", libraryClipId),
      )
      .unique();
    if (existingClip) {
      throw new Error("The Studio Stitch Library destination already exists.");
    }

    await consumeStudioReelRecordWriteRateLimits(ctx, ownerId);
    const now = new Date().toISOString();
    const clipDocumentId = await ctx.db.insert(
      "videoClips",
      createStudioReelLibraryClipFields(output, {
        libraryClipId,
        now,
        ownerId,
        productId,
      }),
    );
    const insertedClip = await ctx.db.get(clipDocumentId);
    if (!insertedClip) {
      throw new Error("The Studio Stitch output could not be saved to the Library.");
    }
    await Promise.all([
      videoClipCounts.insertIfDoesNotExist(ctx, insertedClip),
      videoClipProductCounts.insertIfDoesNotExist(ctx, insertedClip),
      upsertVideoClipCard(ctx, insertedClip),
    ]);
    const notification = getVideoClipNotificationCopy(insertedClip);
    await createNotification(ctx, {
      ownerId,
      productId,
      sourceType: "video-clip",
      sourceId: libraryClipId,
      dedupeKey: `video-clip:${libraryClipId}:created`,
      title: notification.title,
      preview: notification.preview,
      message: notification.message,
      createdAt: now,
    });

    await ctx.db.patch(output._id, {
      acceptedAt: output.acceptedAt ?? now,
      handoff: {
        editorProjectId: output.handoff?.editorProjectId ?? null,
        libraryAssetId: libraryClipId,
        publishingSourceId: output.id,
      },
      revision: output.revision + 1,
      status: "accepted",
      updatedAt: now,
    });
    await createStudioReelWriteReceipt(ctx, {
      ownerId,
      productId,
      idempotencyKey,
      operation: "materializeOutput",
      targetId: id,
      requestFingerprint,
      createdAt: now,
    });

    return toStudioReelMaterializeResult({
      created: true,
      libraryClipId,
      outputId: output.id,
    });
  },
});
