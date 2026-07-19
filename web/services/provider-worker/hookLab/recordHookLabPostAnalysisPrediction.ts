import type { ProcessHookLabPostAnalysisOptions } from "./ProcessHookLabPostAnalysisOptions";
import { markHookLabPostAnalysisJobStatus } from "./markHookLabPostAnalysisJobStatus";

export function recordHookLabPostAnalysisPrediction({
  client,
  job,
  predictionId,
  providerWorkerSecret,
}: ProcessHookLabPostAnalysisOptions & { predictionId: string }) {
  return markHookLabPostAnalysisJobStatus({
    client,
    job,
    progress: 0.65,
    providerJobId: predictionId,
    providerWorkerSecret,
    stage: "hook-lab-analyzing-video",
    status: "running",
  });
}
