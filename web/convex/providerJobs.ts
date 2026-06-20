import { v } from "convex/values";
import { assertMediaWorkerSecret } from "./auth/assertMediaWorkerSecret";
import { assertProviderWorkerSecret } from "./auth/assertProviderWorkerSecret";
import { assertRateLimitApiSecret } from "./auth/assertRateLimitApiSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { providerJobStatusValidator } from "./validators/providerJobStatus";
import { providerJobTypeValidator } from "./validators/providerJobType";
import { requestWorkerLaunch } from "./workerLaunch";

const PROVIDER_JOB_MAX_ATTEMPTS = 3;

function clientJobFields(job: {
  completedAt?: string;
  createdAt: string;
  error?: string;
  id: string;
  jobType: string;
  mediaJobIds: string[];
  outputAssetIds: string[];
  progress: number;
  providerJobIds: string[];
  stage: string;
  status: string;
  updatedAt: string;
}) {
  return {
    id: job.id,
    jobType: job.jobType,
    status: job.status,
    stage: job.stage,
    progress: job.progress,
    providerJobIds: job.providerJobIds,
    mediaJobIds: job.mediaJobIds,
    outputAssetIds: job.outputAssetIds,
    error: job.error,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt,
  };
}

export const get = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const job = await ctx.db
      .query("providerJobs")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    return job ? clientJobFields(job) : null;
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const [queuedJobs, runningJobs] = await Promise.all([
      ctx.db
        .query("providerJobs")
        .withIndex("by_owner_status_created", (q) =>
          q.eq("ownerId", ownerId).eq("status", "queued"),
        )
        .order("desc")
        .take(25),
      ctx.db
        .query("providerJobs")
        .withIndex("by_owner_status_created", (q) =>
          q.eq("ownerId", ownerId).eq("status", "running"),
        )
        .order("desc")
        .take(25),
    ]);
    const jobs = [...queuedJobs, ...runningJobs].sort(
      (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
    );

    return jobs.map(clientJobFields);
  },
});

export const create = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    jobType: providerJobTypeValidator,
    stage: v.string(),
    idempotencyKey: v.string(),
    inputSnapshotJson: v.string(),
    createdAt: v.string(),
  },
  handler: async (ctx, { secret, ...job }) => {
    assertRateLimitApiSecret(secret);

    const existing = await ctx.db
      .query("providerJobs")
      .withIndex("by_idempotency_key", (q) =>
        q.eq("idempotencyKey", job.idempotencyKey),
      )
      .unique();

    if (existing) {
      return clientJobFields(existing);
    }

    const jobId = await ctx.db.insert("providerJobs", {
      ...job,
      status: "queued",
      outputAssetIds: [],
      providerJobIds: [],
      mediaJobIds: [],
      progress: 0,
      attempt: 0,
      updatedAt: job.createdAt,
    });
    const created = await ctx.db.get(jobId);

    if (!created) {
      throw new Error("Unable to create provider job.");
    }

    await requestWorkerLaunch({
      ctx,
      now: job.createdAt,
      worker: "provider",
    });

    return clientJobFields(created);
  },
});

export const createFromMediaWorker = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    jobType: providerJobTypeValidator,
    stage: v.string(),
    idempotencyKey: v.string(),
    inputSnapshotJson: v.string(),
    createdAt: v.string(),
  },
  handler: async (ctx, { secret, ...job }) => {
    assertMediaWorkerSecret(secret);

    const existing = await ctx.db
      .query("providerJobs")
      .withIndex("by_idempotency_key", (q) =>
        q.eq("idempotencyKey", job.idempotencyKey),
      )
      .unique();

    if (existing) {
      return clientJobFields(existing);
    }

    const jobId = await ctx.db.insert("providerJobs", {
      ...job,
      status: "queued",
      outputAssetIds: [],
      providerJobIds: [],
      mediaJobIds: [],
      progress: 0,
      attempt: 0,
      updatedAt: job.createdAt,
    });
    const created = await ctx.db.get(jobId);

    if (!created) {
      throw new Error("Unable to create provider job.");
    }

    await requestWorkerLaunch({
      ctx,
      now: job.createdAt,
      worker: "provider",
    });

    return clientJobFields(created);
  },
});

export const claimNextForProvider = mutation({
  args: {
    secret: v.string(),
    workerId: v.string(),
    lockedUntil: v.string(),
    updatedAt: v.string(),
    jobType: v.optional(providerJobTypeValidator),
    stage: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { secret, workerId, lockedUntil, updatedAt, jobType, stage },
  ) => {
    assertProviderWorkerSecret(secret);

    const matchesJob = (candidate: { jobType: string; stage: string }) =>
      (!jobType || candidate.jobType === jobType) &&
      (!stage || candidate.stage === stage);

    if (stage) {
      const nowMs = Date.parse(updatedAt);
      const runningJobs = jobType
        ? await ctx.db
            .query("providerJobs")
            .withIndex("by_status_job_type_stage_created", (q) =>
              q
                .eq("status", "running")
                .eq("jobType", jobType)
                .eq("stage", stage),
            )
            .order("asc")
            .take(10)
        : await ctx.db
            .query("providerJobs")
            .withIndex("by_status_created", (q) => q.eq("status", "running"))
            .order("asc")
            .take(10);
      const job = runningJobs.find((candidate) => {
        const lockedUntilMs = candidate.lockedUntil
          ? Date.parse(candidate.lockedUntil)
          : 0;

        return (
          matchesJob(candidate) &&
          (!candidate.lockedUntil ||
            !Number.isFinite(lockedUntilMs) ||
            lockedUntilMs <= nowMs)
        );
      });

      if (!job) {
        return null;
      }

      await ctx.db.patch(job._id, {
        lockedBy: workerId,
        lockedUntil,
        updatedAt,
      });

      return await ctx.db.get(job._id);
    }

    const queuedJobs = jobType
      ? await ctx.db
          .query("providerJobs")
          .withIndex("by_status_job_type_created", (q) =>
            q.eq("status", "queued").eq("jobType", jobType),
          )
          .order("asc")
          .take(10)
      : await ctx.db
          .query("providerJobs")
          .withIndex("by_status_created", (q) => q.eq("status", "queued"))
          .order("asc")
          .take(10);
    const job = queuedJobs.find(matchesJob);

    if (!job) {
      return null;
    }

    if (job.attempt >= PROVIDER_JOB_MAX_ATTEMPTS) {
      await ctx.db.patch(job._id, {
        status: "failed",
        error: "Provider job reached the retry limit.",
        updatedAt,
      });

      return null;
    }

    await ctx.db.patch(job._id, {
      status: "running",
      attempt: job.attempt + 1,
      lockedBy: workerId,
      lockedUntil,
      updatedAt,
    });

    return await ctx.db.get(job._id);
  },
});

export const markProviderStatus = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    status: providerJobStatusValidator,
    stage: v.optional(v.string()),
    error: v.optional(v.string()),
    outputAssetId: v.optional(v.string()),
    providerJobId: v.optional(v.string()),
    mediaJobId: v.optional(v.string()),
    progress: v.optional(v.number()),
    releaseLock: v.optional(v.boolean()),
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
      providerJobId,
      mediaJobId,
      progress,
      releaseLock,
      updatedAt,
    },
  ) => {
    assertProviderWorkerSecret(secret);

    const job = await ctx.db
      .query("providerJobs")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!job) {
      throw new Error("Provider job not found.");
    }

    const outputAssetIds =
      outputAssetId && !job.outputAssetIds.includes(outputAssetId)
        ? [...job.outputAssetIds, outputAssetId]
        : job.outputAssetIds;
    const providerJobIds =
      providerJobId && !job.providerJobIds.includes(providerJobId)
        ? [...job.providerJobIds, providerJobId]
        : job.providerJobIds;
    const mediaJobIds =
      mediaJobId && !job.mediaJobIds.includes(mediaJobId)
        ? [...job.mediaJobIds, mediaJobId]
        : job.mediaJobIds;

    await ctx.db.patch(job._id, {
      status,
      ...(stage === undefined ? {} : { stage }),
      outputAssetIds,
      providerJobIds,
      mediaJobIds,
      ...(progress === undefined ? {} : { progress }),
      ...(error === undefined ? {} : { error }),
      ...(status === "running" && !releaseLock
        ? {}
        : { lockedBy: undefined, lockedUntil: undefined }),
      ...(status === "completed" ? { completedAt: updatedAt } : {}),
      updatedAt,
    });

    if (status === "queued") {
      await requestWorkerLaunch({
        ctx,
        now: updatedAt,
        worker: "provider",
      });
    }

    if (status === "running" && releaseLock && stage === "provider-created") {
      await requestWorkerLaunch({
        ctx,
        delayMs: 60_000,
        now: updatedAt,
        worker: "provider",
      });
    }
  },
});

export const markMediaStatus = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    status: providerJobStatusValidator,
    stage: v.optional(v.string()),
    error: v.optional(v.string()),
    outputAssetId: v.optional(v.string()),
    mediaJobId: v.optional(v.string()),
    progress: v.optional(v.number()),
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
      mediaJobId,
      progress,
      updatedAt,
    },
  ) => {
    assertMediaWorkerSecret(secret);

    const job = await ctx.db
      .query("providerJobs")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!job) {
      throw new Error("Provider job not found.");
    }

    const outputAssetIds =
      outputAssetId && !job.outputAssetIds.includes(outputAssetId)
        ? [...job.outputAssetIds, outputAssetId]
        : job.outputAssetIds;
    const mediaJobIds =
      mediaJobId && !job.mediaJobIds.includes(mediaJobId)
        ? [...job.mediaJobIds, mediaJobId]
        : job.mediaJobIds;

    await ctx.db.patch(job._id, {
      status,
      ...(stage === undefined ? {} : { stage }),
      outputAssetIds,
      mediaJobIds,
      ...(progress === undefined ? {} : { progress }),
      ...(error === undefined ? {} : { error }),
      ...(status === "completed" ? { completedAt: updatedAt } : {}),
      lockedBy: undefined,
      lockedUntil: undefined,
      updatedAt,
    });
  },
});
