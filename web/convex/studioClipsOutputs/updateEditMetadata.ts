import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
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
import { studioClipsOutputEditOperationValidator } from "../validators/studioClipsOutputEditOperation";
import { applyStudioClipsOutputEditOperation } from "./applyStudioClipsOutputEditOperation";
import { assertStudioClipsMergeOutputs } from "./assertStudioClipsMergeOutputs";
import { getStudioClipsOutputForOwnerProduct } from "./getStudioClipsOutputForOwnerProduct";
import { normalizeStudioClipsOutputEditOperation } from "./normalizeStudioClipsOutputEditOperation";
import { parseStudioClipsOutputEditState } from "./parseStudioClipsOutputEditState";
import { toStudioClipsOutput } from "./toStudioClipsOutput";

export const updateEditMetadata = mutation({
  args: {
    edit: studioClipsOutputEditOperationValidator,
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
    const task = await getStudioClipsTaskForOwnerProduct(
      ctx,
      ownerId,
      productId,
      taskId,
    );
    if (!task || task.archivedAt)
      throw new Error("Active Studio Clips task not found.");
    const id = assertStudioClipsIdentifier(args.id, "Studio Clips output ID");
    const idempotencyKey = assertStudioClipsBoundedText(args.idempotencyKey, {
      label: "Idempotency key",
      maxLength: STUDIO_CLIPS_PERSISTENCE_LIMITS.idempotencyKeyCharacters,
    });
    if (!Number.isInteger(args.expectedRevision) || args.expectedRevision < 1) {
      throw new Error("Expected output revision is invalid.");
    }
    const edit = normalizeStudioClipsOutputEditOperation(
      args.edit,
      ownerId,
      productId,
    );
    const requestFingerprint = await createStudioClipsRequestFingerprint(
      JSON.stringify({
        edit,
        expectedRevision: args.expectedRevision,
        id,
        productId,
        taskId,
      }),
    );
    const receipt = await getStudioClipsWriteReceipt(
      ctx,
      ownerId,
      idempotencyKey,
    );
    if (receipt) {
      assertStudioClipsMatchingWriteReceipt(receipt, {
        operation: edit.kind,
        productId,
        requestFingerprint,
        targetId: id,
      });
      const existing = await getStudioClipsOutputForOwnerProduct(
        ctx,
        ownerId,
        productId,
        id,
      );
      if (!existing || existing.taskId !== taskId) {
        throw new Error("Studio Clips output not found.");
      }
      return {
        output: toStudioClipsOutput(existing),
        updated: receipt.changed,
      };
    }
    const output = await getStudioClipsOutputForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );
    if (!output || output.taskId !== taskId)
      throw new Error("Studio Clips output not found.");
    if (output.revision !== args.expectedRevision) {
      throw new Error(
        `Studio Clips output revision conflict: expected ${args.expectedRevision}, current ${output.revision}.`,
      );
    }
    if (edit.kind === "merge") {
      await assertStudioClipsMergeOutputs(ctx, {
        outputIds: edit.outputIds,
        ownerId,
        productId,
        taskId,
      });
    }
    await consumeStudioClipsRecordWriteRateLimits(ctx, ownerId);
    const now = new Date().toISOString();
    const next = applyStudioClipsOutputEditOperation(
      parseStudioClipsOutputEditState(
        output.editSnapshotVersion,
        output.editSnapshotJson,
      ),
      edit,
      now,
    );
    const editSnapshotJson = JSON.stringify(next);
    const editSnapshotByteLength = new TextEncoder().encode(
      editSnapshotJson,
    ).byteLength;
    if (
      editSnapshotByteLength > STUDIO_CLIPS_PERSISTENCE_LIMITS.editSnapshotBytes
    ) {
      throw new Error("Studio Clips output edit metadata is too large.");
    }
    const changed = editSnapshotJson !== output.editSnapshotJson;
    const revision = changed ? output.revision + 1 : output.revision;
    if (changed) {
      await ctx.db.patch(output._id, {
        editSnapshotByteLength,
        editSnapshotJson,
        revision,
        updatedAt: now,
      });
    }
    await createStudioClipsWriteReceipt(ctx, {
      changed,
      createdAt: now,
      idempotencyKey,
      operation: edit.kind,
      ownerId,
      productId,
      requestFingerprint,
      resultingRevision: revision,
      targetId: id,
    });
    const updatedOutput = await getStudioClipsOutputForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );
    if (!updatedOutput) throw new Error("Studio Clips output not found.");
    return { output: toStudioClipsOutput(updatedOutput), updated: changed };
  },
});
