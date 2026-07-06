import { getIsCliSwiprBatchRunId } from "./cliSwipr/getIsCliSwiprBatchRunId";
import { getIsStitchrBatchRunId } from "./stitchrBatchRunId";

export function getAutomationBatchJobType(runId: string) {
  if (getIsStitchrBatchRunId(runId)) {
    return "stitchr-batch";
  }

  if (getIsCliSwiprBatchRunId(runId)) {
    return "swipr-batch";
  }

  return null;
}
