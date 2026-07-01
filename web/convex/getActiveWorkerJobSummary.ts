import type { QueryCtx } from "./_generated/server";
import { listActiveWorkerJobSummaries } from "./listActiveWorkerJobSummaries";

type WorkerJobDocument = {
  createdAt: string;
  id: string;
  jobType: string;
  stage: string;
  status: string;
};

const ACTIVE_JOB_SAMPLE_LIMIT = 4;

function clientActiveWorkerJobFields(job: WorkerJobDocument) {
  return {
    id: job.id,
    jobType: job.jobType,
    stage: job.stage,
    status: job.status,
    createdAt: job.createdAt,
  };
}

export async function getActiveWorkerJobSummary(
  ctx: QueryCtx,
  ownerId: string,
) {
  const [providerJobs, mediaJobs] = await Promise.all([
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
  ]);
  const jobs = [...providerJobs, ...mediaJobs].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
  );

  return {
    jobs: jobs.slice(0, 3).map(clientActiveWorkerJobFields),
    totalCount: jobs.length,
  };
}
