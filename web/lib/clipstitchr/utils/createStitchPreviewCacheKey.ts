export function createStitchPreviewCacheKey(
  stitchId: string,
  ugcClipId: string,
  demoClipId: string,
) {
  return [stitchId, ugcClipId, demoClipId].join(":");
}
