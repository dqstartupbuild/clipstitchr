export function createStitchrBatchRunId(
  ownerId: string,
  batchDate: string,
  productId?: string,
  runKey?: string,
) {
  const baseRunId = `stitchr-batch:${ownerId}:${productId?.trim() || "__account__"}:${batchDate}`;
  const normalizedRunKey = runKey?.trim();

  return normalizedRunKey ? `${baseRunId}:${normalizedRunKey}` : baseRunId;
}

export function getIsStitchrBatchRunId(runId: string) {
  return runId.startsWith("stitchr-batch:");
}
