import { v } from "convex/values";
import { STUDIO_EDITOR_PROJECT_VERSION } from "../../lib/clipstitchr/studio/editor/studioEditorProjectVersion";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { consumeStudioEditorProjectWriteRateLimits } from "../studioEditorRateLimits/consumeStudioEditorProjectWriteRateLimits";
import { assertStudioEditorActiveProduct } from "./assertStudioEditorActiveProduct";
import { assertStudioEditorBoundedString } from "./assertStudioEditorBoundedString";
import { assertStudioEditorMatchingWriteReceipt } from "./assertStudioEditorMatchingWriteReceipt";
import { createStudioEditorProjectWriteReceipt } from "./createStudioEditorProjectWriteReceipt";
import { createStudioEditorRequestFingerprint } from "./createStudioEditorRequestFingerprint";
import { getStudioEditorProjectForOwner } from "./getStudioEditorProjectForOwner";
import { getStudioEditorProjectWriteReceipt } from "./getStudioEditorProjectWriteReceipt";
import { insertStudioEditorProjectRevision } from "./insertStudioEditorProjectRevision";
import { normalizeStudioEditorProjectSnapshot } from "./normalizeStudioEditorProjectSnapshot";
import { toStudioEditorProjectWriteResult } from "./toStudioEditorProjectWriteResult";

export const create = mutation({
  args: {
    id: v.string(),
    productId: v.string(),
    name: v.string(),
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
    const name = assertStudioEditorBoundedString(args.name, {
      label: "Studio editor project name",
      maxLength: 200,
    });
    const idempotencyKey = assertStudioEditorBoundedString(
      args.idempotencyKey,
      {
        label: "Idempotency key",
        maxLength: 200,
      },
    );
    const snapshot = normalizeStudioEditorProjectSnapshot(args.snapshotJson, {
      id,
      ownerId,
      productId,
      name,
    });
    const requestFingerprint = await createStudioEditorRequestFingerprint(
      JSON.stringify({
        operation: "create",
        id,
        productId,
        name,
        snapshotJson: snapshot.snapshotJson,
      }),
    );
    const [receipt, existing] = await Promise.all([
      getStudioEditorProjectWriteReceipt(ctx, ownerId, idempotencyKey),
      getStudioEditorProjectForOwner(ctx, ownerId, id),
    ]);
    if (receipt) {
      assertStudioEditorMatchingWriteReceipt(receipt, {
        projectId: id,
        productId,
        operation: "create",
        requestFingerprint,
      });
      return toStudioEditorProjectWriteResult(receipt, false);
    }
    if (existing) {
      throw new Error("Studio editor project ID already exists.");
    }

    await consumeStudioEditorProjectWriteRateLimits(ctx, ownerId);
    const now = new Date().toISOString();
    await ctx.db.insert("studioEditorProjects", {
      ownerId,
      id,
      productId,
      name,
      status: "active",
      recordVersion: 1,
      revision: 1,
      snapshotVersion: STUDIO_EDITOR_PROJECT_VERSION,
      snapshotJson: snapshot.snapshotJson,
      snapshotByteLength: snapshot.byteLength,
      createdAt: now,
      updatedAt: now,
    });
    await insertStudioEditorProjectRevision(ctx, {
      createdAt: now,
      name,
      operation: "create",
      ownerId,
      productId,
      projectId: id,
      revision: 1,
      snapshotByteLength: snapshot.byteLength,
      snapshotJson: snapshot.snapshotJson,
      snapshotVersion: STUDIO_EDITOR_PROJECT_VERSION,
      status: "active",
    });
    const receiptFields = {
      ownerId,
      projectId: id,
      productId,
      idempotencyKey,
      operation: "create" as const,
      requestFingerprint,
      resultingRevision: 1,
      resultingStatus: "active" as const,
      createdAt: now,
    };
    await createStudioEditorProjectWriteReceipt(ctx, receiptFields);
    return toStudioEditorProjectWriteResult(receiptFields, true);
  },
});
