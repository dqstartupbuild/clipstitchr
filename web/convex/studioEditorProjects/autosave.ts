import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { consumeStudioEditorProjectWriteRateLimits } from "../studioEditorRateLimits/consumeStudioEditorProjectWriteRateLimits";
import { assertStudioEditorActiveProduct } from "./assertStudioEditorActiveProduct";
import { assertStudioEditorBoundedString } from "./assertStudioEditorBoundedString";
import { assertStudioEditorMatchingWriteReceipt } from "./assertStudioEditorMatchingWriteReceipt";
import { assertStudioEditorRevision } from "./assertStudioEditorRevision";
import { createStudioEditorProjectWriteReceipt } from "./createStudioEditorProjectWriteReceipt";
import { createStudioEditorRequestFingerprint } from "./createStudioEditorRequestFingerprint";
import { getStudioEditorProjectForOwnerProduct } from "./getStudioEditorProjectForOwnerProduct";
import { getStudioEditorProjectWriteReceipt } from "./getStudioEditorProjectWriteReceipt";
import { insertStudioEditorProjectRevision } from "./insertStudioEditorProjectRevision";
import { normalizeStudioEditorProjectSnapshot } from "./normalizeStudioEditorProjectSnapshot";
import { toStudioEditorProjectWriteResult } from "./toStudioEditorProjectWriteResult";

export const autosave = mutation({
  args: {
    id: v.string(),
    productId: v.string(),
    expectedRevision: v.number(),
    idempotencyKey: v.string(),
    snapshotJson: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const productId = assertStudioEditorBoundedString(args.productId, {
      label: "Product ID",
      maxLength: 120,
    });
    await assertStudioBetaAccess(ctx, ownerId);
    await assertStudioEditorActiveProduct(ctx, ownerId, productId);

    const id = assertStudioEditorBoundedString(args.id, {
      label: "Studio editor project ID",
      maxLength: 120,
    });
    const idempotencyKey = assertStudioEditorBoundedString(
      args.idempotencyKey,
      { label: "Idempotency key", maxLength: 200 },
    );
    const expectedRevision = assertStudioEditorRevision(args.expectedRevision);
    const snapshot = normalizeStudioEditorProjectSnapshot(args.snapshotJson, {
      id,
      ownerId,
      productId,
    });
    const requestFingerprint = await createStudioEditorRequestFingerprint(
      JSON.stringify({
        operation: "autosave",
        id,
        productId,
        expectedRevision,
        snapshotJson: snapshot.snapshotJson,
      }),
    );
    const receipt = await getStudioEditorProjectWriteReceipt(
      ctx,
      ownerId,
      idempotencyKey,
    );
    if (receipt) {
      assertStudioEditorMatchingWriteReceipt(receipt, {
        projectId: id,
        productId,
        operation: "autosave",
        requestFingerprint,
      });
      return toStudioEditorProjectWriteResult(receipt, false);
    }
    const existing = await getStudioEditorProjectForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );
    if (!existing) throw new Error("Studio editor project not found.");
    if (existing.status !== "active")
      throw new Error("Archived Studio editor projects cannot be autosaved.");
    if (existing.revision !== expectedRevision) {
      throw new Error(
        `Studio editor project revision conflict: expected ${expectedRevision}, current ${existing.revision}.`,
      );
    }

    await consumeStudioEditorProjectWriteRateLimits(ctx, ownerId);
    const revision = existing.revision + 1;
    const now = new Date().toISOString();
    await ctx.db.patch(existing._id, {
      name: snapshot.project.name,
      revision,
      snapshotJson: snapshot.snapshotJson,
      snapshotByteLength: snapshot.byteLength,
      updatedAt: now,
    });
    await insertStudioEditorProjectRevision(ctx, {
      createdAt: now,
      name: snapshot.project.name,
      operation: "autosave",
      ownerId,
      productId,
      projectId: id,
      revision,
      snapshotByteLength: snapshot.byteLength,
      snapshotJson: snapshot.snapshotJson,
      snapshotVersion: existing.snapshotVersion,
      status: "active",
    });
    const receiptFields = {
      ownerId,
      projectId: id,
      productId,
      idempotencyKey,
      operation: "autosave" as const,
      requestFingerprint,
      resultingRevision: revision,
      resultingStatus: "active" as const,
      createdAt: now,
    };
    await createStudioEditorProjectWriteReceipt(ctx, receiptFields);
    return toStudioEditorProjectWriteResult(receiptFields, true);
  },
});
