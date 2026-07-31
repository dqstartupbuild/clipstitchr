import type { MutationCtx } from "../_generated/server";
import { enqueueWorkerQueueEntry } from "../workerQueue/enqueueWorkerQueueEntry";
import { requestWorkerLaunch } from "../workerLaunch";
import { upsertWorkerJobSummary } from "../upsertWorkerJobSummary";

export async function enqueueSocialTargetProviderJob(
  ctx: MutationCtx,
  args: {
    idempotencyKey: string;
    inputSnapshotJson: string;
    jobId: string;
    jobType:
      | "social-publish"
      | "social-status-reconcile"
      | "social-analytics-refresh"
      | "social-capability-refresh";
    now: string;
    ownerId: string;
  },
) {
  const existing = await ctx.db
    .query("providerJobs")
    .withIndex("by_idempotency_key", (index) =>
      index.eq("idempotencyKey", args.idempotencyKey),
    )
    .unique();

  if (existing) {
    return existing;
  }

  const providerJobId = await ctx.db.insert("providerJobs", {
    ownerId: args.ownerId,
    id: args.jobId,
    jobType: args.jobType,
    status: "queued",
    stage: "queued",
    idempotencyKey: args.idempotencyKey,
    inputSnapshotJson: args.inputSnapshotJson,
    outputAssetIds: [],
    providerJobIds: [],
    mediaJobIds: [],
    progress: 0,
    attempt: 0,
    createdAt: args.now,
    updatedAt: args.now,
  });
  const job = await ctx.db.get(providerJobId);

  if (!job) {
    throw new Error("Unable to create the social provider job.");
  }

  await upsertWorkerJobSummary(ctx, "provider", job);
  await enqueueWorkerQueueEntry(ctx, {
    generationRequired: false,
    now: args.now,
    ownerId: args.ownerId,
    sourceId: args.jobId,
    sourceKind: "provider_job",
    tool: args.jobType,
    worker: "provider",
  });
  await requestWorkerLaunch({
    ctx,
    now: args.now,
    worker: "provider",
  });

  return job;
}
