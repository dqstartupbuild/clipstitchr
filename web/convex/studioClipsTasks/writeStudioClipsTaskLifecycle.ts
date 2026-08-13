import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { consumeStudioClipsRecordWriteRateLimits } from "../studioClipsRateLimits/consumeStudioClipsRecordWriteRateLimits";
import { assertStudioClipsMatchingWriteReceipt } from "./assertStudioClipsMatchingWriteReceipt";
import { createStudioClipsRequestFingerprint } from "./createStudioClipsRequestFingerprint";
import { createStudioClipsWriteReceipt } from "./createStudioClipsWriteReceipt";
import { getStudioClipsProductHasActiveWork } from "../studioClipsRenderRevisions/getStudioClipsProductHasActiveWork";
import { getStudioClipsExecutionAvailability } from "./getStudioClipsExecutionAvailability";
import { getStudioClipsTaskForOwnerProduct } from "./getStudioClipsTaskForOwnerProduct";
import { getStudioClipsWriteReceipt } from "./getStudioClipsWriteReceipt";
import { toStudioClipsTaskDetail } from "./toStudioClipsTaskDetail";

export async function writeStudioClipsTaskLifecycle(
  ctx: MutationCtx,
  input: {
    idempotencyKey: string;
    operation: "archive" | "cancel" | "resume";
    ownerId: string;
    productId: string;
    taskId: string;
  },
) {
  const requestFingerprint = await createStudioClipsRequestFingerprint(
    JSON.stringify({
      operation: input.operation,
      productId: input.productId,
      taskId: input.taskId,
    }),
  );
  const receipt = await getStudioClipsWriteReceipt(
    ctx,
    input.ownerId,
    input.idempotencyKey,
  );
  if (receipt) {
    assertStudioClipsMatchingWriteReceipt(receipt, {
      operation: input.operation,
      productId: input.productId,
      requestFingerprint,
      targetId: input.taskId,
    });
    const current = await getStudioClipsTaskForOwnerProduct(
      ctx,
      input.ownerId,
      input.productId,
      input.taskId,
    );
    if (!current) throw new Error("Studio Clips task not found.");
    return { task: await toStudioClipsTaskDetail(ctx, current), updated: receipt.changed };
  }
  const task = await getStudioClipsTaskForOwnerProduct(
    ctx,
    input.ownerId,
    input.productId,
    input.taskId,
  );
  if (!task) throw new Error("Studio Clips task not found.");
  await consumeStudioClipsRecordWriteRateLimits(ctx, input.ownerId);
  const now = new Date().toISOString();
  let patch: Partial<Doc<"studioClipsTasks">> = {};
  if (input.operation === "cancel") {
    if (task.status === "completed" || task.status === "error") {
      throw new Error("This Studio Clips task can no longer be cancelled.");
    }
    if (task.status !== "cancelled") {
      patch =
        task.status === "processing"
          ? { cancelRequestedAt: now }
          : { cancelledAt: now, status: "cancelled" };
    }
  } else if (input.operation === "resume") {
    if (task.archivedAt) throw new Error("Archived Studio Clips tasks cannot resume.");
    if (
      task.status !== "cancelled" &&
      task.status !== "error" &&
      task.status !== "provider_unavailable"
    ) {
      throw new Error("This Studio Clips task is not resumable.");
    }
    const execution = getStudioClipsExecutionAvailability();
    const status = execution.state === "available" ? "queued" : "provider_unavailable";
    if (
      status === "queued" &&
      (await getStudioClipsProductHasActiveWork(ctx, {
        excludeTaskId: task.id,
        ownerId: input.ownerId,
        productId: input.productId,
      }))
    ) {
      throw new Error("This Product already has an active Studio Clips task.");
    }
    if (task.status !== status || task.failure || task.cancelRequestedAt) {
      patch = {
        cancelRequestedAt: undefined,
        cancelledAt: undefined,
        errorAt: undefined,
        execution,
        failure: undefined,
        leaseExpiresAt: undefined,
        leaseId: undefined,
        leaseWorkerId: undefined,
        status,
      };
    }
  } else if (!task.archivedAt) {
    patch = {
      archivedAt: now,
      ...(task.status === "processing"
        ? { cancelRequestedAt: now }
        : task.status === "queued" || task.status === "provider_unavailable"
          ? { cancelledAt: now, status: "cancelled" as const }
          : {}),
    };
  }
  const changed = Object.keys(patch).length > 0;
  const revision = changed ? task.revision + 1 : task.revision;
  if (changed) {
    await ctx.db.patch(task._id, { ...patch, revision, updatedAt: now });
  }
  await createStudioClipsWriteReceipt(ctx, {
    changed,
    createdAt: now,
    idempotencyKey: input.idempotencyKey,
    operation: input.operation,
    ownerId: input.ownerId,
    productId: input.productId,
    requestFingerprint,
    resultingRevision: revision,
    targetId: input.taskId,
  });
  const updatedTask = await getStudioClipsTaskForOwnerProduct(
    ctx,
    input.ownerId,
    input.productId,
    input.taskId,
  );
  if (!updatedTask) throw new Error("Studio Clips task not found.");
  return { task: await toStudioClipsTaskDetail(ctx, updatedTask), updated: changed };
}
