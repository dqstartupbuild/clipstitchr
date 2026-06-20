import type { QueryCtx } from "./_generated/server";

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
  const [providerQueued, providerRunning, mediaQueued, mediaRunning] =
    await Promise.all([
      ctx.db
        .query("providerJobs")
        .withIndex("by_owner_status_created", (q) =>
          q.eq("ownerId", ownerId).eq("status", "queued"),
        )
        .order("desc")
        .take(ACTIVE_JOB_SAMPLE_LIMIT),
      ctx.db
        .query("providerJobs")
        .withIndex("by_owner_status_created", (q) =>
          q.eq("ownerId", ownerId).eq("status", "running"),
        )
        .order("desc")
        .take(ACTIVE_JOB_SAMPLE_LIMIT),
      ctx.db
        .query("mediaJobs")
        .withIndex("by_owner_status_created", (q) =>
          q.eq("ownerId", ownerId).eq("status", "queued"),
        )
        .order("desc")
        .take(ACTIVE_JOB_SAMPLE_LIMIT),
      ctx.db
        .query("mediaJobs")
        .withIndex("by_owner_status_created", (q) =>
          q.eq("ownerId", ownerId).eq("status", "running"),
        )
        .order("desc")
        .take(ACTIVE_JOB_SAMPLE_LIMIT),
    ]);
  const jobs = [
    ...providerQueued,
    ...providerRunning,
    ...mediaQueued,
    ...mediaRunning,
  ].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
  );

  return {
    jobs: jobs.slice(0, 3).map(clientActiveWorkerJobFields),
    totalCount: jobs.length,
  };
}
