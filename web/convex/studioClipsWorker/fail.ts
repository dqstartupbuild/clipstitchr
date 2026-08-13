import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { consumeStudioClipsWorkerWriteRateLimits } from "../studioClipsRateLimits/consumeStudioClipsWorkerWriteRateLimits";
import { studioClipsCheckpointValidator } from "../validators/studioClipsCheckpoint";
import { studioClipsFailureValidator } from "../validators/studioClipsFailure";
import { studioClipsResumeCheckpointValidator } from "../validators/studioClipsResumeCheckpoint";
import { assertStudioClipsWorkerLease } from "./assertStudioClipsWorkerLease";
import { assertStudioClipsWorkerSecret } from "./assertStudioClipsWorkerSecret";
import { getStudioClipsWorkerTask } from "./getStudioClipsWorkerTask";
import { normalizeStudioClipsWorkerFailure } from "./normalizeStudioClipsWorkerFailure";

export const fail = mutation({
  args: {
    attempt: v.number(),
    checkpoint: studioClipsCheckpointValidator,
    failure: studioClipsFailureValidator,
    leaseId: v.string(),
    ownerId: v.string(),
    productId: v.string(),
    resume: v.optional(
      v.object({
        checkpoint: studioClipsResumeCheckpointValidator,
        revision: v.number(),
      }),
    ),
    secret: v.string(),
    taskId: v.string(),
  },
  handler: async (ctx, args) => {
    assertStudioClipsWorkerSecret(args.secret);
    const failure = normalizeStudioClipsWorkerFailure(args.failure);
    const task = await getStudioClipsWorkerTask(ctx, args);
    if (
      task?.status === "error" &&
      task.attempt === args.attempt &&
      !task.leaseId &&
      task.failure?.code === failure.code &&
      task.failure.kind === failure.kind &&
      task.failure.message === failure.message
    ) {
      return { failed: false };
    }
    const leasedTask = assertStudioClipsWorkerLease(task, args);
    await consumeStudioClipsWorkerWriteRateLimits(ctx, leasedTask.ownerId);
    const now = new Date().toISOString();
    const latestEvent = (
      await ctx.db
        .query("studioClipsTaskEvents")
        .withIndex("by_owner_product_task_occurred", (query) =>
          query
            .eq("ownerId", leasedTask.ownerId)
            .eq("productId", leasedTask.productId)
            .eq("taskId", leasedTask.id),
        )
        .order("desc")
        .first()
    );
    if (
      !latestEvent ||
      latestEvent.attempt !== args.attempt ||
      latestEvent.code !== "failed" ||
      latestEvent.status !== "error" ||
      latestEvent.failure?.code !== failure.code ||
      latestEvent.failure.kind !== failure.kind ||
      latestEvent.failure.message !== failure.message
    ) {
      await ctx.db.insert("studioClipsTaskEvents", {
        attempt: args.attempt,
        checkpoint: args.checkpoint,
        code: "failed",
        failure,
        occurredAt: now,
        ownerId: leasedTask.ownerId,
        productId: leasedTask.productId,
        progressPercent: leasedTask.progressPercent,
        ...(args.resume
          ? {
              resumeCheckpoint: args.resume.checkpoint,
              resumeRevision: args.resume.revision,
            }
          : {}),
        schemaVersion: "studio-clips-progress-v1",
        status: "error",
        taskId: leasedTask.id,
      });
    }
    await ctx.db.patch(leasedTask._id, {
      checkpoint: args.checkpoint,
      errorAt: now,
      failure,
      latestCode: "failed",
      leaseExpiresAt: undefined,
      leaseId: undefined,
      leaseWorkerId: undefined,
      ...(args.resume
        ? {
            resumeCheckpoint: args.resume.checkpoint,
            resumeRevision: args.resume.revision,
          }
        : {}),
      revision: leasedTask.revision + 1,
      status: "error",
      updatedAt: now,
    });
    return { failed: true };
  },
});
