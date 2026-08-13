import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { consumeStudioClipsRecordWriteRateLimits } from "../studioClipsRateLimits/consumeStudioClipsRecordWriteRateLimits";
import { assertStudioClipsMatchingWriteReceipt } from "../studioClipsTasks/assertStudioClipsMatchingWriteReceipt";
import { createStudioClipsRequestFingerprint } from "../studioClipsTasks/createStudioClipsRequestFingerprint";
import { createStudioClipsWriteReceipt } from "../studioClipsTasks/createStudioClipsWriteReceipt";
import { getStudioClipsExecutionAvailability } from "../studioClipsTasks/getStudioClipsExecutionAvailability";
import { getStudioClipsWriteReceipt } from "../studioClipsTasks/getStudioClipsWriteReceipt";
import { getStudioClipsProductHasActiveWork } from "./getStudioClipsProductHasActiveWork";
import { getStudioClipsRenderRevisionForOwnerProduct } from "./getStudioClipsRenderRevisionForOwnerProduct";
import { toStudioClipsRenderRevisionSummary } from "./toStudioClipsRenderRevisionSummary";

export async function writeStudioClipsRenderRevisionLifecycle(
  ctx: MutationCtx,
  input: {
    id: string;
    idempotencyKey: string;
    operation: "render_revision_cancel" | "render_revision_resume";
    ownerId: string;
    productId: string;
  },
) {
  const fingerprint = await createStudioClipsRequestFingerprint(
    JSON.stringify({ id: input.id, operation: input.operation, productId: input.productId }),
  );
  const receipt = await getStudioClipsWriteReceipt(ctx, input.ownerId, input.idempotencyKey);
  if (receipt) {
    assertStudioClipsMatchingWriteReceipt(receipt, {
      operation: input.operation,
      productId: input.productId,
      requestFingerprint: fingerprint,
      targetId: input.id,
    });
    const existing = await getStudioClipsRenderRevisionForOwnerProduct(
      ctx,
      input.ownerId,
      input.productId,
      input.id,
    );
    if (!existing) throw new Error("Studio Clips render revision not found.");
    return { renderRevision: toStudioClipsRenderRevisionSummary(existing), updated: receipt.changed };
  }
  const value = await getStudioClipsRenderRevisionForOwnerProduct(
    ctx,
    input.ownerId,
    input.productId,
    input.id,
  );
  if (!value) throw new Error("Studio Clips render revision not found.");
  await consumeStudioClipsRecordWriteRateLimits(ctx, input.ownerId);
  const now = new Date().toISOString();
  let patch: Partial<Doc<"studioClipsRenderRevisions">> = {};
  if (input.operation === "render_revision_cancel") {
    if (value.status === "completed" || value.status === "error") {
      throw new Error("This render revision can no longer be cancelled.");
    }
    if (value.status !== "cancelled") {
      patch = value.status === "processing"
        ? { cancelRequestedAt: now }
        : { cancelledAt: now, status: "cancelled" };
    }
  } else {
    if (!["cancelled", "error", "provider_unavailable"].includes(value.status)) {
      throw new Error("This render revision is not resumable.");
    }
    if (
      await getStudioClipsProductHasActiveWork(ctx, {
        excludeRenderRevisionId: value.id,
        ownerId: input.ownerId,
        productId: input.productId,
      })
    ) {
      throw new Error("This Product already has active Studio Clips work.");
    }
    const execution = getStudioClipsExecutionAvailability();
    patch = {
      cancelRequestedAt: undefined,
      cancelledAt: undefined,
      errorAt: undefined,
      execution,
      failure: undefined,
      leaseExpiresAt: undefined,
      leaseId: undefined,
      leaseWorkerId: undefined,
      status: execution.state === "available" ? "queued" : "provider_unavailable",
    };
  }
  const changed = Object.keys(patch).length > 0;
  const revision = changed ? value.revision + 1 : value.revision;
  if (changed) await ctx.db.patch(value._id, { ...patch, revision, updatedAt: now });
  await createStudioClipsWriteReceipt(ctx, {
    changed,
    createdAt: now,
    idempotencyKey: input.idempotencyKey,
    operation: input.operation,
    ownerId: input.ownerId,
    productId: input.productId,
    requestFingerprint: fingerprint,
    resultingRevision: revision,
    targetId: input.id,
  });
  const updated = await getStudioClipsRenderRevisionForOwnerProduct(
    ctx,
    input.ownerId,
    input.productId,
    input.id,
  );
  if (!updated) throw new Error("Studio Clips render revision not found.");
  return { renderRevision: toStudioClipsRenderRevisionSummary(updated), updated: changed };
}
