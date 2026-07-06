import type { QueryCtx } from "./_generated/server";
import { listActiveAutomationBatchJobSummaries } from "./listActiveAutomationBatchJobSummaries";
import { listActiveWorkerJobSummaries } from "./listActiveWorkerJobSummaries";

type WorkerJobDocument = {
  createdAt: string;
  error?: string;
  id: string;
  jobType: string;
  mediaJobIds?: string[];
  outputAssetIds?: string[];
  progress?: number;
  providerJobIds?: string[];
  stage: string;
  status: string;
  updatedAt?: string;
  worker?: "media" | "provider";
};

const ACTIVE_JOB_SAMPLE_LIMIT = 4;

function clientActiveWorkerJobFields(job: WorkerJobDocument) {
  return {
    id: job.id,
    jobType: job.jobType,
    stage: job.stage,
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    progress: job.progress,
    providerJobIds: job.providerJobIds,
    mediaJobIds: job.mediaJobIds,
    outputAssetIds: job.outputAssetIds,
    error: job.error,
    worker: job.worker,
  };
}

export async function getActiveWorkerJobSummary(
  ctx: QueryCtx,
  ownerId: string,
) {
  const [providerJobs, mediaJobs, automationBatchJobs] = await Promise.all([
    listActiveWorkerJobSummaries(
      ctx,
      ownerId,
      "provider",
      ACTIVE_JOB_SAMPLE_LIMIT,
    ),
    listActiveWorkerJobSummaries(
      ctx,
      ownerId,
      "media",
      ACTIVE_JOB_SAMPLE_LIMIT,
    ),
    listActiveAutomationBatchJobSummaries(
      ctx,
      ownerId,
      ACTIVE_JOB_SAMPLE_LIMIT,
    ),
  ]);
  const jobs = [...providerJobs, ...mediaJobs, ...automationBatchJobs].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
  );

  return {
    jobs: jobs.slice(0, 3).map(clientActiveWorkerJobFields),
    totalCount: jobs.length,
  };
}
