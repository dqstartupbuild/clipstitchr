import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { consumeStudioEditorProjectWriteRateLimits } from "../studioEditorRateLimits/consumeStudioEditorProjectWriteRateLimits";
import { assertStudioEditorMatchingWriteReceipt } from "./assertStudioEditorMatchingWriteReceipt";
import { createStudioEditorProjectWriteReceipt } from "./createStudioEditorProjectWriteReceipt";
import { createStudioEditorRequestFingerprint } from "./createStudioEditorRequestFingerprint";
import { getStudioEditorProjectForOwnerProduct } from "./getStudioEditorProjectForOwnerProduct";
import { getStudioEditorProjectWriteReceipt } from "./getStudioEditorProjectWriteReceipt";
import { insertStudioEditorProjectRevision } from "./insertStudioEditorProjectRevision";
import { toStudioEditorProjectWriteResult } from "./toStudioEditorProjectWriteResult";

export async function changeStudioEditorProjectStatus(
  ctx: MutationCtx,
  input: {
    ownerId: string;
    projectId: string;
    productId: string;
    expectedRevision: number;
    idempotencyKey: string;
    operation: "archive" | "reopen";
    fromStatus: Doc<"studioEditorProjects">["status"];
    toStatus: Doc<"studioEditorProjects">["status"];
  },
) {
  const requestFingerprint = await createStudioEditorRequestFingerprint(
    JSON.stringify({
      operation: input.operation,
      id: input.projectId,
      productId: input.productId,
      expectedRevision: input.expectedRevision,
    }),
  );
  const receipt = await getStudioEditorProjectWriteReceipt(
    ctx,
    input.ownerId,
    input.idempotencyKey,
  );
  if (receipt) {
    assertStudioEditorMatchingWriteReceipt(receipt, {
      projectId: input.projectId,
      productId: input.productId,
      operation: input.operation,
      requestFingerprint,
    });
    return toStudioEditorProjectWriteResult(receipt, false);
  }
  const existing = await getStudioEditorProjectForOwnerProduct(
    ctx,
    input.ownerId,
    input.productId,
    input.projectId,
  );
  if (!existing) throw new Error("Studio editor project not found.");
  if (existing.status !== input.fromStatus) {
    throw new Error(
      `Studio editor project must be ${input.fromStatus} before ${input.operation}.`,
    );
  }
  if (existing.revision !== input.expectedRevision) {
    throw new Error(
      `Studio editor project revision conflict: expected ${input.expectedRevision}, current ${existing.revision}.`,
    );
  }

  await consumeStudioEditorProjectWriteRateLimits(ctx, input.ownerId);
  const revision = existing.revision + 1;
  const now = new Date().toISOString();
  await ctx.db.patch(existing._id, {
    status: input.toStatus,
    revision,
    updatedAt: now,
    archivedAt: input.toStatus === "archived" ? now : undefined,
  });
  await insertStudioEditorProjectRevision(ctx, {
    createdAt: now,
    name: existing.name,
    operation: input.operation,
    ownerId: input.ownerId,
    productId: input.productId,
    projectId: input.projectId,
    revision,
    snapshotByteLength: existing.snapshotByteLength,
    snapshotJson: existing.snapshotJson,
    snapshotVersion: existing.snapshotVersion,
    status: input.toStatus,
  });
  const receiptFields = {
    ownerId: input.ownerId,
    projectId: input.projectId,
    productId: input.productId,
    idempotencyKey: input.idempotencyKey,
    operation: input.operation,
    requestFingerprint,
    resultingRevision: revision,
    resultingStatus: input.toStatus,
    createdAt: now,
  };
  await createStudioEditorProjectWriteReceipt(ctx, receiptFields);
  return toStudioEditorProjectWriteResult(receiptFields, true);
}
