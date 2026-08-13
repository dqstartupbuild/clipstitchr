import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { consumeStudioClipsWorkerWriteRateLimits } from "../studioClipsRateLimits/consumeStudioClipsWorkerWriteRateLimits";
import { studioClipsCheckpointValidator } from "../validators/studioClipsCheckpoint";
import { studioClipsFailureValidator } from "../validators/studioClipsFailure";
import { studioClipsProgressCodeValidator } from "../validators/studioClipsProgressCode";
import { studioClipsResumeCheckpointValidator } from "../validators/studioClipsResumeCheckpoint";
import { studioClipsWorkerStatusValidator } from "../validators/studioClipsWorkerStatus";
import { assertStudioClipsWorkerLease } from "./assertStudioClipsWorkerLease";
import { assertStudioClipsWorkerSecret } from "./assertStudioClipsWorkerSecret";
import { getStudioClipsStoredProgressPercent } from "./getStudioClipsStoredProgressPercent";
import { getStudioClipsWorkerTask } from "./getStudioClipsWorkerTask";
import { normalizeStudioClipsWorkerFailure } from "./normalizeStudioClipsWorkerFailure";

export const progress = mutation({
  args: {
    event: v.object({
      attempt: v.number(),
      checkpoint: studioClipsCheckpointValidator,
      code: studioClipsProgressCodeValidator,
      failure: v.optional(studioClipsFailureValidator),
      occurredAt: v.string(),
      ownerId: v.string(),
      productId: v.string(),
      progressPercent: v.number(),
      resume: v.optional(
        v.object({
          checkpoint: studioClipsResumeCheckpointValidator,
          revision: v.number(),
        }),
      ),
      schemaVersion: v.literal("studio-clips-progress-v1"),
      status: studioClipsWorkerStatusValidator,
      taskId: v.string(),
    }),
    leaseId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    assertStudioClipsWorkerSecret(args.secret);
    const event = args.event;
    if (
      !Number.isInteger(event.attempt) ||
      event.attempt < 1 ||
      !Number.isInteger(event.progressPercent) ||
      event.progressPercent < 0 ||
      event.progressPercent > 100 ||
      !Number.isFinite(Date.parse(event.occurredAt)) ||
      event.status === "queued"
    ) {
      throw new Error("Studio Clips progress event is invalid.");
    }
    const task = assertStudioClipsWorkerLease(
      await getStudioClipsWorkerTask(ctx, event),
      { attempt: event.attempt, leaseId: args.leaseId },
    );
    const storedProgressPercent = getStudioClipsStoredProgressPercent({
      code: event.code,
      currentProgressPercent: task.progressPercent,
      reportedProgressPercent: event.progressPercent,
    });
    const failure = event.failure
      ? normalizeStudioClipsWorkerFailure(event.failure)
      : undefined;
    if (event.status === "error" && !failure) {
      throw new Error("Failed Studio Clips progress requires a failure.");
    }
    await consumeStudioClipsWorkerWriteRateLimits(ctx, task.ownerId);
    await ctx.db.insert("studioClipsTaskEvents", {
      attempt: event.attempt,
      checkpoint: event.checkpoint,
      code: event.code,
      ...(failure ? { failure } : {}),
      occurredAt: event.occurredAt,
      ownerId: task.ownerId,
      productId: task.productId,
      progressPercent: storedProgressPercent,
      ...(event.resume
        ? {
            resumeCheckpoint: event.resume.checkpoint,
            resumeRevision: event.resume.revision,
          }
        : {}),
      schemaVersion: "studio-clips-progress-v1",
      status: event.status,
      taskId: task.id,
    });
    const now = new Date().toISOString();
    const terminalPatch =
      event.status === "cancelled"
        ? {
            cancelledAt: event.occurredAt,
            leaseExpiresAt: undefined,
            leaseId: undefined,
            leaseWorkerId: undefined,
            status: "cancelled" as const,
          }
        : event.status === "error"
          ? {
              errorAt: event.occurredAt,
              failure,
              status: "error" as const,
            }
          : {};
    await ctx.db.patch(task._id, {
      checkpoint: event.checkpoint,
      latestCode: event.code,
      progressPercent: storedProgressPercent,
      ...(event.resume
        ? {
            resumeCheckpoint: event.resume.checkpoint,
            resumeRevision: event.resume.revision,
          }
        : {}),
      revision: task.revision + 1,
      ...terminalPatch,
      ...(event.status !== "cancelled"
        ? { leaseExpiresAt: new Date(Date.now() + 300_000).toISOString() }
        : {}),
      updatedAt: now,
    });
    return { accepted: true };
  },
});
