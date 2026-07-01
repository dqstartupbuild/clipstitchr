import type { Doc } from "./_generated/dataModel";

export function createWorkerJobSummaryFields(
  worker: "media" | "provider",
  job: Doc<"mediaJobs"> | Doc<"providerJobs">,
) {
  return {
    ownerId: job.ownerId,
    id: job.id,
    worker,
    jobType: job.jobType,
    status: job.status,
    stage: job.stage,
    outputAssetIds: job.outputAssetIds,
    providerJobIds: "providerJobIds" in job ? job.providerJobIds : undefined,
    mediaJobIds: "mediaJobIds" in job ? job.mediaJobIds : undefined,
    progress: "progress" in job ? job.progress : undefined,
    error: job.error,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt,
  };
}
