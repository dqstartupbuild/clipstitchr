import { HOOK_LAB_APIFY_POLL_DELAY_MS } from "./hookLabAnalysisConstants";
import { markHookLabPostAnalysisJobStatus } from "./markHookLabPostAnalysisJobStatus";
import type { ProcessHookLabPostAnalysisOptions } from "./ProcessHookLabPostAnalysisOptions";

export async function waitForHookLabPostActor({
  client,
  job,
  providerWorkerSecret,
  runId,
}: ProcessHookLabPostAnalysisOptions & { runId: string }) {
  await markHookLabPostAnalysisJobStatus({
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
