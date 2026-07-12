import type { ProcessHookLabIdeaAnalysisOptions } from "./ProcessHookLabIdeaAnalysisOptions";
import { markHookLabAnalysisJobStatus } from "./markHookLabAnalysisJobStatus";

export function recordHookLabAnalysisPrediction({
  client,
  job,
  predictionId,
  providerWorkerSecret,
}: ProcessHookLabIdeaAnalysisOptions & { predictionId: string }) {
  return markHookLabAnalysisJobStatus({
    client,
    job,
    progress: 0.65,
    providerJobId: predictionId,
    providerWorkerSecret,
    stage: "hook-lab-analyzing-source",
    status: "running",
  });
}
