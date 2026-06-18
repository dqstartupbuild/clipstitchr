export function createStitchrBatchRunId(ownerId: string, batchDate: string) {
  return `stitchr-batch:${ownerId}:${batchDate}`;
}

export function getIsStitchrBatchRunId(runId: string) {
  return runId.startsWith("stitchr-batch:");
}
