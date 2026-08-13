import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { consumeStudioClipsWorkerWriteRateLimits } from "../studioClipsRateLimits/consumeStudioClipsWorkerWriteRateLimits";
import { STUDIO_CLIPS_PERSISTENCE_LIMITS } from "../studioClipsTasks/studioClipsPersistenceLimits";
import { normalizeStudioClipsSafeJsonSnapshot } from "../studioClipsOutputs/normalizeStudioClipsSafeJsonSnapshot";
import { studioClipsResumeCheckpointValidator } from "../validators/studioClipsResumeCheckpoint";
import { assertStudioClipsWorkerLease } from "./assertStudioClipsWorkerLease";
import { assertStudioClipsWorkerSecret } from "./assertStudioClipsWorkerSecret";
import { getStudioClipsWorkerTask } from "./getStudioClipsWorkerTask";

export const checkpoint = mutation({
  args: {
    attempt: v.number(),
    checkpoint: studioClipsResumeCheckpointValidator,
    expectedRevision: v.number(),
    leaseId: v.string(),
    ownerId: v.string(),
    productId: v.string(),
    secret: v.string(),
    snapshotJson: v.string(),
    taskId: v.string(),
  },
  handler: async (ctx, args) => {
    assertStudioClipsWorkerSecret(args.secret);
    if (
      !Number.isInteger(args.expectedRevision) ||
      args.expectedRevision < 0 ||
      !Number.isInteger(args.attempt) ||
      args.attempt < 1
    ) {
      throw new Error("Studio Clips checkpoint revision is invalid.");
    }
    const task = assertStudioClipsWorkerLease(
      await getStudioClipsWorkerTask(ctx, args),
      args,
    );
    const snapshot = normalizeStudioClipsSafeJsonSnapshot(
      args.snapshotJson,
      STUDIO_CLIPS_PERSISTENCE_LIMITS.checkpointSnapshotBytes,
    );
    const revision = args.expectedRevision + 1;
    const existing = await ctx.db
      .query("studioClipsCheckpoints")
      .withIndex("by_owner_product_task_revision", (query) =>
        query
          .eq("ownerId", task.ownerId)
          .eq("productId", task.productId)
          .eq("taskId", task.id)
          .eq("revision", revision),
      )
      .unique();
    if (existing) {
      if (
        existing.attempt !== args.attempt ||
        existing.checkpoint !== args.checkpoint ||
        existing.snapshotJson !== snapshot.json
      ) {
        throw new Error("Studio Clips checkpoint revision conflict.");
      }
      return { checkpoint: existing.checkpoint, revision: existing.revision };
    }
    if ((task.resumeRevision ?? 0) !== args.expectedRevision) {
      throw new Error("Studio Clips checkpoint revision conflict.");
    }
    await consumeStudioClipsWorkerWriteRateLimits(ctx, task.ownerId);
    const now = new Date().toISOString();
    await ctx.db.insert("studioClipsCheckpoints", {
      attempt: args.attempt,
      checkpoint: args.checkpoint,
      createdAt: now,
      ownerId: task.ownerId,
      productId: task.productId,
      revision,
      snapshotByteLength: snapshot.byteLength,
      snapshotJson: snapshot.json,
      taskId: task.id,
    });
    await ctx.db.patch(task._id, {
      checkpoint: args.checkpoint,
      leaseExpiresAt: new Date(Date.now() + 300_000).toISOString(),
      resumeCheckpoint: args.checkpoint,
      resumeRevision: revision,
      revision: task.revision + 1,
      updatedAt: now,
    });
    return { checkpoint: args.checkpoint, revision };
  },
});
