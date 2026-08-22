export function createStitchSequencePreviewCacheKey(
  stitchId: string,
  clipIds: string[],
) {
  return `${stitchId}:${clipIds.join(",")}`;
}
