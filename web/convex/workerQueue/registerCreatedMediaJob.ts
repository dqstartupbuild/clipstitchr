import type { MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { requestWorkerLaunch } from "../workerLaunch";
import { upsertWorkerJobSummary } from "../upsertWorkerJobSummary";
import { enqueueWorkerQueueEntry } from "./enqueueWorkerQueueEntry";

export async function registerCreatedMediaJob(
  ctx: MutationCtx,
  mediaJob: Doc<"mediaJobs">,
) {
  await upsertWorkerJobSummary(ctx, "media", mediaJob);

  if (mediaJob.status !== "queued") {
    return;
  }

  await enqueueWorkerQueueEntry(ctx, {
    generationRequired: true,
    generationSlotId: mediaJob.generationSlotId,
    now: mediaJob.updatedAt,
    ownerId: mediaJob.ownerId,
    sourceId: mediaJob.id,
    sourceKind: "media_job",
    tool: mediaJob.jobType,
    usageReservationId: mediaJob.usageReservationId,
    worker: "media",
  });
  await requestWorkerLaunch({
    ctx,
    now: mediaJob.updatedAt,
    worker: "media",
  });
}
