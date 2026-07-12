import { HOOK_LAB_APIFY_POLL_DELAY_MS } from "./hookLabAnalysisConstants";
import { markHookLabAnalysisJobStatus } from "./markHookLabAnalysisJobStatus";
import type { ProcessHookLabIdeaAnalysisOptions } from "./ProcessHookLabIdeaAnalysisOptions";

export async function waitForHookLabApifyRun({
  client,
  job,
  providerWorkerSecret,
  runId,
}: ProcessHookLabIdeaAnalysisOptions & { runId: string }) {
  await markHookLabAnalysisJobStatus({
    client,
    continuationDelayMs: HOOK_LAB_APIFY_POLL_DELAY_MS,
    job,
    progress: 0.2,
    providerJobId: runId,
    providerWorkerSecret,
    releaseLock: true,
    stage: "hook-lab-awaiting-apify",
    status: "running",
  });
}
