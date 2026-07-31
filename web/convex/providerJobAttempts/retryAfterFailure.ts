import { v } from "convex/values";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { mutation } from "../_generated/server";
import { upsertWorkerJobSummary } from "../upsertWorkerJobSummary";
import { requestWorkerLaunch } from "../workerLaunch";
import { updateWorkerQueueEntryStatus } from "../workerQueue/updateWorkerQueueEntryStatus";

const PROVIDER_JOB_MAX_ATTEMPTS = 3;

export const retryAfterFailure = mutation({
  args: {
    error: v.string(),
    id: v.string(),
    ownerId: v.string(),
    secret: v.string(),
    continuationDelayMs: v.optional(v.number()),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);
    const job = await ctx.db
      .query("providerJobs")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", args.id),
      )
      .unique();

    if (!job) {
      throw new Error("Provider job not found.");
    }

    if (
      job.status === "completed" ||
      job.status === "failed" ||
      job.status === "canceled"
    ) {
      return false;
    }

    if (job.attempt >= PROVIDER_JOB_MAX_ATTEMPTS) {
      return false;
    }

    const continuationDelayMs =
      args.continuationDelayMs === undefined
        ? undefined
        : Math.min(
            Math.max(Math.round(args.continuationDelayMs), 1_000),
            10 * 60_000,
          );

    await ctx.db.patch(job._id, {
      error: args.error.trim().slice(0, 500),
      lockedBy: undefined,
      lockedUntil: undefined,
      stage: "retry-queued",
      status: "queued",
      updatedAt: args.updatedAt,
    });
    const queuedJob = await ctx.db.get(job._id);

    if (!queuedJob) {
      throw new Error("Provider job disappeared while queuing its retry.");
    }

    await upsertWorkerJobSummary(ctx, "provider", queuedJob);
    await updateWorkerQueueEntryStatus(ctx, {
      continuationDelayMs,
      error: args.error.trim().slice(0, 500),
      now: args.updatedAt,
      releaseLock: true,
      sourceId: job.id,
      sourceKind: "provider_job",
      status: "queued",
    });
    await requestWorkerLaunch({
      ctx,
      delayMs: continuationDelayMs,
      now: args.updatedAt,
      worker: "provider",
    });

    return true;
  },
});
