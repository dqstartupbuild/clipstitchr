import { anyApi } from "convex/server";
import type { ProcessHookLabPostAnalysisOptions } from "./ProcessHookLabPostAnalysisOptions";

const api = anyApi;

export async function markHookLabPostAnalysisJobStatus({
  client,
  continuationDelayMs,
  job,
  progress,
  providerJobId,
  providerWorkerSecret,
  releaseLock,
  stage,
  status,
}: ProcessHookLabPostAnalysisOptions & {
  continuationDelayMs?: number;
  progress?: number;
  providerJobId?: string;
  releaseLock?: boolean;
  stage: string;
  status: "running" | "completed";
}) {
  await client.mutation(api.providerJobs.markProviderStatus, {
    secret: providerWorkerSecret,
    ownerId: job.ownerId,
    id: job.id,
    status,
    stage,
    progress,
    providerJobId,
    releaseLock,
    continuationDelayMs,
    updatedAt: new Date().toISOString(),
  });
}
