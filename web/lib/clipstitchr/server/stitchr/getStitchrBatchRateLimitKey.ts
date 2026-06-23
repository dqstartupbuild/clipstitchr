export function getStitchrBatchRateLimitKey(
  ownerId: string,
  batchDate: string,
) {
  return `${ownerId}:${batchDate}`;
}
