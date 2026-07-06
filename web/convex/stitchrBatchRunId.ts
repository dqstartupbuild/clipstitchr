export function createStitchrBatchRunId(
  ownerId: string,
  batchDate: string,
  productId?: string,
) {
  return `stitchr-batch:${ownerId}:${productId?.trim() || "__account__"}:${batchDate}`;
}

export function getIsStitchrBatchRunId(runId: string) {
  return runId.startsWith("stitchr-batch:");
}
