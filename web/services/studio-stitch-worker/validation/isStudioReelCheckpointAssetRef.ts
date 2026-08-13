import type { StudioStitchAssetRef } from "../../../lib/clipstitchr/types/studioStitch/StudioStitchAssetRef";

export function isStudioReelCheckpointAssetRef(
  value: unknown,
): value is StudioStitchAssetRef {
  if (!value || Array.isArray(value) || typeof value !== "object") return false;
  const source = value as Record<string, unknown>;
  return (
    (source.kind === "videoClip" &&
      typeof source.videoClipId === "string" &&
      source.videoClipId.length <= 240) ||
    (source.kind === "stitch" &&
      typeof source.stitchId === "string" &&
      source.stitchId.length <= 240) ||
    (source.kind === "studioOutput" &&
      typeof source.outputId === "string" &&
      source.outputId.length <= 240) ||
    (source.kind === "studioUpload" &&
      typeof source.objectKey === "string" &&
      source.objectKey.length <= 1_024)
  );
}
