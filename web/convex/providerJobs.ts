import { v } from "convex/values";
import { assertMediaWorkerSecret } from "./auth/assertMediaWorkerSecret";
import { assertProviderWorkerSecret } from "./auth/assertProviderWorkerSecret";
import { assertRateLimitApiSecret } from "./auth/assertRateLimitApiSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { providerJobStatusValidator } from "./validators/providerJobStatus";
import { providerJobTypeValidator } from "./validators/providerJobType";
import { listActiveWorkerJobSummaries } from "./listActiveWorkerJobSummaries";
import { upsertWorkerJobSummary } from "./upsertWorkerJobSummary";
import { requestWorkerLaunch } from "./workerLaunch";
import { enqueueWorkerQueueEntry } from "./workerQueue/enqueueWorkerQueueEntry";
import { getGenerationRequiredForProviderJob } from "./workerQueue/getGenerationRequiredForProviderJob";
import { updateWorkerQueueEntryStatus } from "./workerQueue/updateWorkerQueueEntryStatus";

const PROVIDER_JOB_MAX_ATTEMPTS = 3;

function clientJobFields(job: {
  completedAt?: string;
  createdAt: string;
  error?: string;
  id: string;
  jobType: string;
  mediaJobIds?: string[];
  outputAssetIds: string[];
  progress?: number;
  providerJobIds?: string[];
  stage: string;
  status: string;
  updatedAt: string;
}) {
  return {
    id: job.id,
    jobType: job.jobType,
    status: job.status,
    stage: job.stage,
    progress: job.progress ?? 0,
    providerJobIds: job.providerJobIds ?? [],
    mediaJobIds: job.mediaJobIds ?? [],
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
    const jobs = await listActiveWorkerJobSummaries(ctx, ownerId, "provider");

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
    usageReservationId: v.optional(v.string()),
    usageReservationIds: v.optional(v.array(v.string())),
    generationSlotId: v.optional(v.string()),
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
      await upsertWorkerJobSummary(ctx, "provider", existing);

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
      usageReservationId: job.usageReservationId,
      usageReservationIds: job.usageReservationIds,
      generationSlotId: job.generationSlotId,
      updatedAt: job.createdAt,
    });
    const created = await ctx.db.get(jobId);

    if (!created) {
      throw new Error("Unable to create provider job.");
    }

    await upsertWorkerJobSummary(ctx, "provider", created);
    await enqueueWorkerQueueEntry(ctx, {
      generationRequired: getGenerationRequiredForProviderJob(created.jobType),
      generationSlotId: created.generationSlotId,
      now: created.createdAt,
      ownerId: created.ownerId,
      sourceId: created.id,
      sourceKind: "provider_job",
      tool: created.jobType,
      usageReservationId: created.usageReservationId,
      usageReservationIds: created.usageReservationIds,
      worker: "provider",
    });

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
    usageReservationId: v.optional(v.string()),
    usageReservationIds: v.optional(v.array(v.string())),
    generationSlotId: v.optional(v.string()),
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
      await upsertWorkerJobSummary(ctx, "provider", existing);

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
      usageReservationId: job.usageReservationId,
      usageReservationIds: job.usageReservationIds,
      generationSlotId: job.generationSlotId,
      updatedAt: job.createdAt,
    });
    const created = await ctx.db.get(jobId);

    if (!created) {
      throw new Error("Unable to create provider job.");
    }

    await upsertWorkerJobSummary(ctx, "provider", created);
    await enqueueWorkerQueueEntry(ctx, {
      generationRequired: getGenerationRequiredForProviderJob(created.jobType),
      generationSlotId: created.generationSlotId,
      now: created.createdAt,
      ownerId: created.ownerId,
      sourceId: created.id,
      sourceKind: "provider_job",
      tool: created.jobType,
      usageReservationId: created.usageReservationId,
      usageReservationIds: created.usageReservationIds,
      worker: "provider",
    });

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

    const nowMs = Date.parse(updatedAt);

    if (!Number.isFinite(nowMs)) {
      throw new Error("Provider job claim time is invalid.");
    }

    if (stage) {
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

      const reclaimedJob = await ctx.db.get(job._id);

      if (reclaimedJob) {
        await upsertWorkerJobSummary(ctx, "provider", reclaimedJob);
      }

      return reclaimedJob;
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
    let job = queuedJobs.find(matchesJob);

    if (!job) {
      const runningJobs = jobType
        ? await ctx.db
            .query("providerJobs")
            .withIndex("by_status_job_type_created", (q) =>
              q.eq("status", "running").eq("jobType", jobType),
            )
            .order("asc")
            .take(50)
        : await ctx.db
            .query("providerJobs")
            .withIndex("by_status_created", (q) => q.eq("status", "running"))
            .order("asc")
            .take(50);

      job = runningJobs.find((candidate) => {
        const lockedUntilMs = candidate.lockedUntil
          ? Date.parse(candidate.lockedUntil)
          : Number.NaN;

        return (
          matchesJob(candidate) &&
          Boolean(candidate.lockedUntil) &&
          Number.isFinite(lockedUntilMs) &&
          lockedUntilMs <= nowMs
        );
      });
    }

    if (!job) {
      return null;
    }

    if (job.attempt >= PROVIDER_JOB_MAX_ATTEMPTS) {
      await ctx.db.patch(job._id, {
        status: "failed",
        stage: "retry-limit",
        error: "Provider job reached the retry limit.",
        lockedBy: undefined,
        lockedUntil: undefined,
        updatedAt,
      });
      const failedJob = await ctx.db.get(job._id);

      if (failedJob) {
        await upsertWorkerJobSummary(ctx, "provider", failedJob);
      }

      return failedJob;
    }

    await ctx.db.patch(job._id, {
      status: "running",
      attempt: job.attempt + 1,
      lockedBy: workerId,
      lockedUntil,
      updatedAt,
    });

    const claimedJob = await ctx.db.get(job._id);

    if (claimedJob) {
      await upsertWorkerJobSummary(ctx, "provider", claimedJob);
    }

    return claimedJob;
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
    continuationDelayMs: v.optional(v.number()),
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
      continuationDelayMs,
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
    const updatedJob = await ctx.db.get(job._id);

    if (updatedJob) {
      await upsertWorkerJobSummary(ctx, "provider", updatedJob);
    }

    if (status === "queued") {
      await requestWorkerLaunch({
        ctx,
        now: updatedAt,
        worker: "provider",
      });
    }

    const relaunchDelayMs =
      continuationDelayMs !== undefined
        ? Math.min(Math.max(Math.round(continuationDelayMs), 1_000), 10 * 60_000)
        : stage === "provider-created"
          ? 60_000
          : undefined;

    await updateWorkerQueueEntryStatus(ctx, {
      continuationDelayMs: relaunchDelayMs,
      error,
      handoff: Boolean(mediaJobId && status === "running" && releaseLock),
      now: updatedAt,
      releaseLock,
      sourceId: id,
      sourceKind: "provider_job",
      status,
    });

    if (status === "running" && releaseLock && relaunchDelayMs !== undefined) {
      await requestWorkerLaunch({
        ctx,
        delayMs: relaunchDelayMs,
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
    const updatedJob = await ctx.db.get(job._id);

    if (updatedJob) {
      await upsertWorkerJobSummary(ctx, "provider", updatedJob);
    }

    await updateWorkerQueueEntryStatus(ctx, {
      error,
      handoff: Boolean(mediaJobId && status === "running"),
      now: updatedAt,
      sourceId: id,
      sourceKind: "provider_job",
      status,
    });
  },
});
