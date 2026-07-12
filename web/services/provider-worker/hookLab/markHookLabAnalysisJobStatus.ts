import { anyApi } from "convex/server";
import type { ProcessHookLabIdeaAnalysisOptions } from "./ProcessHookLabIdeaAnalysisOptions";

const api = anyApi;

type MarkHookLabAnalysisJobStatusOptions = ProcessHookLabIdeaAnalysisOptions & {
  continuationDelayMs?: number;
  mediaJobId?: string;
  progress?: number;
  providerJobId?: string;
  releaseLock?: boolean;
  stage: string;
  status: "running" | "completed";
};

export async function markHookLabAnalysisJobStatus({
  client,
  continuationDelayMs,
  job,
  mediaJobId,
  progress,
  providerJobId,
  providerWorkerSecret,
  releaseLock,
  stage,
  status,
}: MarkHookLabAnalysisJobStatusOptions) {
  await client.mutation(api.providerJobs.markProviderStatus, {
    secret: providerWorkerSecret,
    ownerId: job.ownerId,
    id: job.id,
    status,
    stage,
    mediaJobId,
    progress,
    providerJobId,
    releaseLock,
    continuationDelayMs,
    updatedAt: new Date().toISOString(),
  });
}
