import { getIsStitchrBatchRunId } from "./stitchrBatchRunId";

export function getAutomationBatchJobType(runId: string) {
  if (getIsStitchrBatchRunId(runId)) {
    return "stitchr-batch";
  }

  return null;
}
