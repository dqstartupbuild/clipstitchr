import { v } from "convex/values";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { assertMediaWorkerSecret } from "./auth/assertMediaWorkerSecret";
import { assertProviderWorkerSecret } from "./auth/assertProviderWorkerSecret";
import { assertRateLimitApiSecret } from "./auth/assertRateLimitApiSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { mediaJobStatusValidator } from "./validators/mediaJobStatus";
import { mediaJobTypeValidator } from "./validators/mediaJobType";
import { listActiveWorkerJobSummaries } from "./listActiveWorkerJobSummaries";
import { upsertWorkerJobSummary } from "./upsertWorkerJobSummary";
import { registerCreatedMediaJob } from "./workerQueue/registerCreatedMediaJob";
import { refreshQueuedMediaJobHandoff } from "./workerQueue/refreshQueuedMediaJobHandoff";
import { updateWorkerQueueEntryStatus } from "./workerQueue/updateWorkerQueueEntryStatus";

const mediaMaxJobAttempts = 3;

function clientJobFields(job: {
  completedAt?: string;
  createdAt: string;
  error?: string;
  id: string;
  jobType: string;
  outputAssetIds: string[];
  stage: string;
  status: string;
  updatedAt: string;
}) {
  return {
    id: job.id,
    jobType: job.jobType,
    status: job.status,
    stage: job.stage,
    outputAssetIds: job.outputAssetIds,
    error: job.error,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt,
  };
}

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const jobs = await listActiveWorkerJobSummaries(ctx, ownerId, "media");

    return jobs.map(clientJobFields);
  },
});

export const createUploadNormalization = mutation({
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
    assertRateLimitApiSecret(secret);

    const existing = await ctx.db
      .query("mediaJobs")
      .withIndex("by_idempotency_key", (q) =>
        q.eq("idempotencyKey", idempotencyKey),
      )
      .unique();

    if (existing) {
      await registerCreatedMediaJob(ctx, existing);

      return existing;
    }

    const mediaJobId = await ctx.db.insert("mediaJobs", {
      ownerId,
      id,
      jobType: "upload-normalization",
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

    await registerCreatedMediaJob(ctx, mediaJob);

    return mediaJob;
  },
});

export const createCliprFinalizationFromAutomation = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    idempotencyKey: v.string(),
    inputSnapshotJson: v.string(),
    createdAt: v.string(),
    usageReservationId: v.optional(v.string()),
  },
  handler: async (
    ctx,
    {
      secret,
      ownerId,
      id,
      idempotencyKey,
      inputSnapshotJson,
      createdAt,
      usageReservationId,
    },
  ) => {
    assertAutomationWorkerSecret(secret);

    const existing = await ctx.db
      .query("mediaJobs")
      .withIndex("by_idempotency_key", (q) =>
        q.eq("idempotencyKey", idempotencyKey),
      )
      .unique();

    if (existing) {
      await registerCreatedMediaJob(ctx, existing);

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
      usageReservationId,
      outputAssetIds: [],
      attempt: 0,
      createdAt,
      updatedAt: createdAt,
    });
    const mediaJob = await ctx.db.get(mediaJobId);

    if (!mediaJob) {
      throw new Error("Unable to create media job.");
    }

    await registerCreatedMediaJob(ctx, mediaJob);

    return mediaJob;
  },
});

export const createCliprFinalizationFromProvider = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    idempotencyKey: v.string(),
    inputSnapshotJson: v.string(),
    createdAt: v.string(),
    usageReservationId: v.optional(v.string()),
    generationSlotId: v.optional(v.string()),
  },
  handler: async (
    ctx,
    {
      secret,
      ownerId,
      id,
      idempotencyKey,
      inputSnapshotJson,
      createdAt,
      usageReservationId,
      generationSlotId,
    },
  ) => {
    assertProviderWorkerSecret(secret);

    const existing = await ctx.db
      .query("mediaJobs")
      .withIndex("by_idempotency_key", (q) =>
        q.eq("idempotencyKey", idempotencyKey),
      )
      .unique();

    if (existing) {
      const refreshed = await refreshQueuedMediaJobHandoff(ctx, existing, {
        generationSlotId,
        updatedAt: createdAt,
        usageReservationId,
      });
      await registerCreatedMediaJob(ctx, refreshed);

      return refreshed;
    }

    const mediaJobId = await ctx.db.insert("mediaJobs", {
      ownerId,
      id,
      jobType: "clipr-finalization",
      status: "queued",
      stage: "queued",
      idempotencyKey,
      inputSnapshotJson,
      usageReservationId,
      generationSlotId,
      outputAssetIds: [],
      attempt: 0,
      createdAt,
      updatedAt: createdAt,
    });
    const mediaJob = await ctx.db.get(mediaJobId);

    if (!mediaJob) {
      throw new Error("Unable to create media job.");
    }

    await registerCreatedMediaJob(ctx, mediaJob);

    return mediaJob;
  },
});

export const createHookLabVariantFinalizationFromProvider = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    idempotencyKey: v.string(),
    inputSnapshotJson: v.string(),
    createdAt: v.string(),
    usageReservationId: v.optional(v.string()),
    generationSlotId: v.optional(v.string()),
  },
  handler: async (
    ctx,
    {
      secret,
      ownerId,
      id,
      idempotencyKey,
      inputSnapshotJson,
      createdAt,
      usageReservationId,
      generationSlotId,
    },
  ) => {
    assertProviderWorkerSecret(secret);
    const existing = await ctx.db
      .query("mediaJobs")
      .withIndex("by_idempotency_key", (q) =>
        q.eq("idempotencyKey", idempotencyKey),
      )
      .unique();

    if (existing) {
      if (existing.status === "failed") {
        await ctx.db.patch(existing._id, {
          attempt: 0,
          error: undefined,
          inputSnapshotJson,
          usageReservationId,
          generationSlotId,
          lockedBy: undefined,
          lockedUntil: undefined,
          stage: "queued",
          status: "queued",
          updatedAt: createdAt,
        });
      }

      const refreshed = await ctx.db.get(existing._id);

      if (refreshed) {
        await registerCreatedMediaJob(ctx, refreshed);
      }

      return refreshed ?? existing;
    }

    const mediaJobId = await ctx.db.insert("mediaJobs", {
      ownerId,
      id,
      jobType: "hook-lab-variant-finalization",
      status: "queued",
      stage: "queued",
      idempotencyKey,
      inputSnapshotJson,
      usageReservationId,
      generationSlotId,
      outputAssetIds: [],
      attempt: 0,
      createdAt,
      updatedAt: createdAt,
    });
    const mediaJob = await ctx.db.get(mediaJobId);

    if (!mediaJob) {
      throw new Error("Unable to create Hook Lab media job.");
    }

    await registerCreatedMediaJob(ctx, mediaJob);

    return mediaJob;
  },
});

export const createSwaprFinalizationFromAutomation = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    idempotencyKey: v.string(),
    inputSnapshotJson: v.string(),
    createdAt: v.string(),
    usageReservationId: v.optional(v.string()),
  },
  handler: async (
    ctx,
    {
      secret,
      ownerId,
      id,
      idempotencyKey,
      inputSnapshotJson,
      createdAt,
      usageReservationId,
    },
  ) => {
    assertAutomationWorkerSecret(secret);

    const existing = await ctx.db
      .query("mediaJobs")
      .withIndex("by_idempotency_key", (q) =>
        q.eq("idempotencyKey", idempotencyKey),
      )
      .unique();

    if (existing) {
      await registerCreatedMediaJob(ctx, existing);

      return existing;
    }

    const mediaJobId = await ctx.db.insert("mediaJobs", {
      ownerId,
      id,
      jobType: "swapr-finalization",
      status: "queued",
      stage: "queued",
      idempotencyKey,
      inputSnapshotJson,
      usageReservationId,
      outputAssetIds: [],
      attempt: 0,
      createdAt,
      updatedAt: createdAt,
    });
    const mediaJob = await ctx.db.get(mediaJobId);

    if (!mediaJob) {
      throw new Error("Unable to create media job.");
    }

    await registerCreatedMediaJob(ctx, mediaJob);

    return mediaJob;
  },
});

export const createSwaprFinalizationFromProvider = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    idempotencyKey: v.string(),
    inputSnapshotJson: v.string(),
    createdAt: v.string(),
    usageReservationId: v.optional(v.string()),
    generationSlotId: v.optional(v.string()),
  },
  handler: async (
    ctx,
    {
      secret,
      ownerId,
      id,
      idempotencyKey,
      inputSnapshotJson,
      createdAt,
      usageReservationId,
      generationSlotId,
    },
  ) => {
    assertProviderWorkerSecret(secret);

    const existing = await ctx.db
      .query("mediaJobs")
      .withIndex("by_idempotency_key", (q) =>
        q.eq("idempotencyKey", idempotencyKey),
      )
      .unique();

    if (existing) {
      const refreshed = await refreshQueuedMediaJobHandoff(ctx, existing, {
        generationSlotId,
        updatedAt: createdAt,
        usageReservationId,
      });
      await registerCreatedMediaJob(ctx, refreshed);

      return refreshed;
    }

    const mediaJobId = await ctx.db.insert("mediaJobs", {
      ownerId,
      id,
      jobType: "swapr-finalization",
      status: "queued",
      stage: "queued",
      idempotencyKey,
      inputSnapshotJson,
      usageReservationId,
      generationSlotId,
      outputAssetIds: [],
      attempt: 0,
      createdAt,
      updatedAt: createdAt,
    });
    const mediaJob = await ctx.db.get(mediaJobId);

    if (!mediaJob) {
      throw new Error("Unable to create media job.");
    }

    await registerCreatedMediaJob(ctx, mediaJob);

    return mediaJob;
  },
});

export const createStitchrDraftFinalizationFromProvider = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    idempotencyKey: v.string(),
    inputSnapshotJson: v.string(),
    createdAt: v.string(),
    usageReservationId: v.optional(v.string()),
    generationSlotId: v.optional(v.string()),
  },
  handler: async (
    ctx,
    {
      secret,
      ownerId,
      id,
      idempotencyKey,
      inputSnapshotJson,
      createdAt,
      usageReservationId,
      generationSlotId,
    },
  ) => {
    assertProviderWorkerSecret(secret);

    const existing = await ctx.db
      .query("mediaJobs")
      .withIndex("by_idempotency_key", (q) =>
        q.eq("idempotencyKey", idempotencyKey),
      )
      .unique();

    if (existing) {
      if (
        existing.outputAssetIds.length === 0 &&
        (existing.status === "queued" ||
          existing.status === "running" ||
          existing.status === "failed" ||
          existing.status === "completed")
      ) {
        await ctx.db.patch(existing._id, {
          status: "queued",
          stage: "retry-queued",
          lockedBy: undefined,
          lockedUntil: undefined,
          error: undefined,
          generationSlotId,
          usageReservationId,
          updatedAt: createdAt,
        });
        const retriedJob = (await ctx.db.get(existing._id)) ?? existing;
        await registerCreatedMediaJob(ctx, retriedJob);

        return retriedJob;
      }

      await registerCreatedMediaJob(ctx, existing);

      return existing;
    }

    const mediaJobId = await ctx.db.insert("mediaJobs", {
      ownerId,
      id,
      jobType: "stitchr-draft-finalization",
      status: "queued",
      stage: "queued",
      idempotencyKey,
      inputSnapshotJson,
      usageReservationId,
      generationSlotId,
      outputAssetIds: [],
      attempt: 0,
      createdAt,
      updatedAt: createdAt,
    });
    const mediaJob = await ctx.db.get(mediaJobId);

    if (!mediaJob) {
      throw new Error("Unable to create media job.");
    }

    await registerCreatedMediaJob(ctx, mediaJob);

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
  handler: async (
    ctx,
    { secret, workerId, lockedUntil, updatedAt, jobType },
  ) => {
    assertMediaWorkerSecret(secret);

    const matchesJobType = (candidate: { jobType: string }) =>
      jobType ? candidate.jobType === jobType : true;
    const queuedJobs = jobType
      ? await ctx.db
          .query("mediaJobs")
          .withIndex("by_status_job_type_created", (q) =>
            q.eq("status", "queued").eq("jobType", jobType),
          )
          .order("asc")
          .take(10)
      : await ctx.db
          .query("mediaJobs")
          .withIndex("by_status_created", (q) => q.eq("status", "queued"))
          .order("asc")
          .take(10);
    let job = queuedJobs.find(matchesJobType);

    if (!job) {
      const nowMs = Date.parse(updatedAt);
      const runningJobs = jobType
        ? await ctx.db
            .query("mediaJobs")
            .withIndex("by_status_job_type_created", (q) =>
              q.eq("status", "running").eq("jobType", jobType),
            )
            .order("asc")
            .take(10)
        : await ctx.db
            .query("mediaJobs")
            .withIndex("by_status_created", (q) => q.eq("status", "running"))
            .order("asc")
            .take(10);

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
      const failedJob = await ctx.db.get(job._id);

      if (failedJob) {
        await upsertWorkerJobSummary(ctx, "media", failedJob);
      }

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

    const claimedJob = await ctx.db.get(job._id);

    if (claimedJob) {
      await upsertWorkerJobSummary(ctx, "media", claimedJob);
    }

    return claimedJob;
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
    { secret, ownerId, id, status, stage, error, outputAssetId, updatedAt },
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
    const updatedJob = await ctx.db.get(job._id);

    if (updatedJob) {
      await upsertWorkerJobSummary(ctx, "media", updatedJob);
    }

    await updateWorkerQueueEntryStatus(ctx, {
      error,
      now: updatedAt,
      sourceId: id,
      sourceKind: "media_job",
      status,
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
