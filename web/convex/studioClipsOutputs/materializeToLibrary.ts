import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { videoClipCounts, videoClipProductCounts } from "../aggregateCounts";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { createNotification } from "../createNotification";
import { getVideoClipNotificationCopy } from "../getVideoClipNotificationCopy";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { consumeStudioClipsRecordWriteRateLimits } from "../studioClipsRateLimits/consumeStudioClipsRecordWriteRateLimits";
import { assertStudioClipsActiveProduct } from "../studioClipsTasks/assertStudioClipsActiveProduct";
import { assertStudioClipsBoundedText } from "../studioClipsTasks/assertStudioClipsBoundedText";
import { assertStudioClipsIdentifier } from "../studioClipsTasks/assertStudioClipsIdentifier";
import { assertStudioClipsMatchingWriteReceipt } from "../studioClipsTasks/assertStudioClipsMatchingWriteReceipt";
import { createStudioClipsRequestFingerprint } from "../studioClipsTasks/createStudioClipsRequestFingerprint";
import { createStudioClipsWriteReceipt } from "../studioClipsTasks/createStudioClipsWriteReceipt";
import { getStudioClipsTaskForOwnerProduct } from "../studioClipsTasks/getStudioClipsTaskForOwnerProduct";
import { getStudioClipsWriteReceipt } from "../studioClipsTasks/getStudioClipsWriteReceipt";
import { STUDIO_CLIPS_PERSISTENCE_LIMITS } from "../studioClipsTasks/studioClipsPersistenceLimits";
import { upsertVideoClipCard } from "../upsertVideoClipCard";
import { createStudioClipsLibraryClipFields } from "./createStudioClipsLibraryClipFields";
import { createStudioClipsLibraryClipId } from "./createStudioClipsLibraryClipId";
import { assertStudioClipsOutputObjectKey } from "./assertStudioClipsOutputObjectKey";
import { getStudioClipsOutputForOwnerProduct } from "./getStudioClipsOutputForOwnerProduct";
import { toStudioClipsOutput } from "./toStudioClipsOutput";

export const materializeToLibrary = mutation({
  args: {
    expectedRevision: v.number(),
    id: v.string(),
    idempotencyKey: v.string(),
    productId: v.string(),
    taskId: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    await assertStudioBetaAccess(ctx, ownerId);
    const productId = assertStudioClipsIdentifier(args.productId, "Product ID");
    await assertStudioClipsActiveProduct(ctx, ownerId, productId);
    const taskId = assertStudioClipsIdentifier(
      args.taskId,
      "Studio Clips task ID",
    );
    const id = assertStudioClipsIdentifier(args.id, "Studio Clips output ID");
    const idempotencyKey = assertStudioClipsBoundedText(args.idempotencyKey, {
      label: "Idempotency key",
      maxLength: STUDIO_CLIPS_PERSISTENCE_LIMITS.idempotencyKeyCharacters,
    });
    if (!Number.isInteger(args.expectedRevision) || args.expectedRevision < 1) {
      throw new Error("Expected output revision is invalid.");
    }

    const task = await getStudioClipsTaskForOwnerProduct(
      ctx,
      ownerId,
      productId,
      taskId,
    );
    if (!task || task.archivedAt || task.status !== "completed") {
      throw new Error("Completed Studio Clips task not found.");
    }
    const output = await getStudioClipsOutputForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );
    if (!output || output.taskId !== taskId) {
      throw new Error("Studio Clips output not found.");
    }
    assertStudioClipsOutputObjectKey({
      objectKey: output.objectKey,
      ownerId,
      productId,
      workId: output.renderRevisionId ?? output.taskId,
    });

    const libraryClipId =
      output.libraryClipId ?? createStudioClipsLibraryClipId(output.id);
    const requestFingerprint = await createStudioClipsRequestFingerprint(
      JSON.stringify({ id, libraryClipId, productId, taskId }),
    );
    const receipt = await getStudioClipsWriteReceipt(
      ctx,
      ownerId,
      idempotencyKey,
    );
    if (receipt) {
      assertStudioClipsMatchingWriteReceipt(receipt, {
        operation: "materialize",
        productId,
        requestFingerprint,
        targetId: id,
      });
      const current = await getStudioClipsOutputForOwnerProduct(
        ctx,
        ownerId,
        productId,
        id,
      );
      if (!current?.libraryClipId) {
        throw new Error("Studio Clips Library receipt has no saved output.");
      }
      return {
        created: false,
        libraryClipId: current.libraryClipId,
        output: toStudioClipsOutput(current),
      };
    }

    if (output.libraryClipId) {
      return {
        created: false,
        libraryClipId: output.libraryClipId,
        output: toStudioClipsOutput(output),
      };
    }
    if (output.revision !== args.expectedRevision) {
      throw new Error(
        `Studio Clips output revision conflict: expected ${args.expectedRevision}, current ${output.revision}.`,
      );
    }

    const now = new Date().toISOString();
    const clipFields = createStudioClipsLibraryClipFields(output, {
      libraryClipId,
      now,
      ownerId,
      productId,
    });
    const existingClip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (query) =>
        query.eq("ownerId", ownerId).eq("id", libraryClipId),
      )
      .unique();
    if (existingClip) {
      throw new Error("The Studio Clips Library destination already exists.");
    }

    await consumeStudioClipsRecordWriteRateLimits(ctx, ownerId);
    const clipDocumentId = await ctx.db.insert("videoClips", clipFields);
    const insertedClip = await ctx.db.get(clipDocumentId);
    if (!insertedClip) {
      throw new Error("The Studio clip could not be saved to the Library.");
    }
    await Promise.all([
      videoClipCounts.insertIfDoesNotExist(ctx, insertedClip),
      videoClipProductCounts.insertIfDoesNotExist(ctx, insertedClip),
      upsertVideoClipCard(ctx, insertedClip),
    ]);
    const notificationCopy = getVideoClipNotificationCopy(insertedClip);
    await createNotification(ctx, {
      ownerId,
      productId,
      sourceType: "video-clip",
      sourceId: libraryClipId,
      dedupeKey: `video-clip:${libraryClipId}:created`,
      title: notificationCopy.title,
      preview: notificationCopy.preview,
      message: notificationCopy.message,
      createdAt: now,
    });

    const revision = output.revision + 1;
    await ctx.db.patch(output._id, {
      libraryClipId,
      revision,
      updatedAt: now,
    });
    await createStudioClipsWriteReceipt(ctx, {
      changed: true,
      createdAt: now,
      idempotencyKey,
      operation: "materialize",
      ownerId,
      productId,
      requestFingerprint,
      resultingRevision: revision,
      targetId: id,
    });
    const updated = await getStudioClipsOutputForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );
    if (!updated) {
      throw new Error("Studio Clips output not found after Library save.");
    }
    return {
      created: true,
      libraryClipId,
      output: toStudioClipsOutput(updated),
    };
  },
});
