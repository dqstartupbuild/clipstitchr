import { v } from "convex/values";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { assertMediaWorkerSecret } from "./auth/assertMediaWorkerSecret";
import { mutation, query } from "./_generated/server";
import { mediaJobStatusValidator } from "./validators/mediaJobStatus";
import { mediaJobTypeValidator } from "./validators/mediaJobType";

const mediaMaxJobAttempts = 3;

export const createCliprFinalizationFromAutomation = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    idempotencyKey: v.string(),
    inputSnapshotJson: v.string(),
    createdAt: v.string(),
  },
  handler: async (
    ctx,
    { secret, ownerId, id, idempotencyKey, inputSnapshotJson, createdAt },
  ) => {
    assertAutomationWorkerSecret(secret);

    const existing = await ctx.db
      .query("mediaJobs")
      .withIndex("by_idempotency_key", (q) =>
        q.eq("idempotencyKey", idempotencyKey),
      )
      .unique();

    if (existing) {
      return existing;
    }

    const mediaJobId = await ctx.db.insert("mediaJobs", {
      ownerId,
      id,
      jobType: "clipr-finalization",
      status: "queued",
      stage: "queued",
      idempotencyKey,
      inputSnapshotJson,
      outputAssetIds: [],
      attempt: 0,
      createdAt,
      updatedAt: createdAt,
    });
    const mediaJob = await ctx.db.get(mediaJobId);

    if (!mediaJob) {
      throw new Error("Unable to create media job.");
    }

    return mediaJob;
  },
});

export const claimNext = mutation({
  args: {
    secret: v.string(),
    workerId: v.string(),
    lockedUntil: v.string(),
    updatedAt: v.string(),
    jobType: v.optional(mediaJobTypeValidator),
  },
  handler: async (ctx, { secret, workerId, lockedUntil, updatedAt, jobType }) => {
    assertMediaWorkerSecret(secret);

    const matchesJobType = (candidate: { jobType: string }) =>
      jobType ? candidate.jobType === jobType : true;
    const queuedJobs = await ctx.db
      .query("mediaJobs")
      .withIndex("by_status_created", (q) => q.eq("status", "queued"))
      .order("asc")
      .take(50);
    let job = queuedJobs.find(matchesJobType);

    if (!job) {
      const nowMs = Date.parse(updatedAt);
      const runningJobs = await ctx.db
        .query("mediaJobs")
        .withIndex("by_status_created", (q) => q.eq("status", "running"))
        .order("asc")
        .take(50);

      job = runningJobs.find((candidate) => {
        const lockedUntilMs = candidate.lockedUntil
          ? Date.parse(candidate.lockedUntil)
          : 0;

        return (
          matchesJobType(candidate) &&
          (!candidate.lockedUntil ||
            !Number.isFinite(lockedUntilMs) ||
            lockedUntilMs <= nowMs)
        );
      });
    }

    if (!job) {
      return null;
    }

    if (job.attempt >= mediaMaxJobAttempts) {
      await ctx.db.patch(job._id, {
        status: "failed",
        stage: "retry-limit",
        error: "Media job reached the retry limit.",
        updatedAt,
      });

      return null;
    }

    await ctx.db.patch(job._id, {
      status: "running",
      stage: "claimed",
      attempt: job.attempt + 1,
      lockedBy: workerId,
      lockedUntil,
      updatedAt,
    });

    return await ctx.db.get(job._id);
  },
});

export const markStatus = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    status: mediaJobStatusValidator,
    stage: v.optional(v.string()),
    error: v.optional(v.string()),
    outputAssetId: v.optional(v.string()),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    {
      secret,
      ownerId,
      id,
      status,
      stage,
      error,
      outputAssetId,
      updatedAt,
    },
  ) => {
    assertMediaWorkerSecret(secret);

    const job = await ctx.db
      .query("mediaJobs")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!job) {
      throw new Error("Media job not found.");
    }

    const outputAssetIds =
      outputAssetId && !job.outputAssetIds.includes(outputAssetId)
        ? [...job.outputAssetIds, outputAssetId]
        : job.outputAssetIds;

    await ctx.db.patch(job._id, {
      status,
      ...(stage === undefined ? {} : { stage }),
      outputAssetIds,
      ...(status === "completed" ? { completedAt: updatedAt } : {}),
      ...(status === "running"
        ? {}
        : { lockedBy: undefined, lockedUntil: undefined }),
      ...(error === undefined ? {} : { error }),
      updatedAt,
    });
  },
});

export const getForWorker = query({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
  },
  handler: async (ctx, { secret, ownerId, id }) => {
    assertMediaWorkerSecret(secret);

    return await ctx.db
      .query("mediaJobs")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();
  },
});
