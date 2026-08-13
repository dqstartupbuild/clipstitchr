import type { StudioStitchAssetRef } from "../../types/studioStitch/StudioStitchAssetRef";
import { isStudioStitchRecord } from "./isStudioStitchRecord";

export function isStudioStitchAssetRef(
  value: unknown,
): value is StudioStitchAssetRef {
  if (!isStudioStitchRecord(value) || typeof value.kind !== "string") {
    return false;
  }
  const expectedField =
    value.kind === "videoClip"
      ? "videoClipId"
      : value.kind === "stitch"
        ? "stitchId"
        : value.kind === "studioOutput"
          ? "outputId"
          : value.kind === "studioUpload"
            ? "objectKey"
            : null;
  if (expectedField === null || Object.keys(value).length !== 2) {
    return false;
  }
  const identifier = value[expectedField];
  return (
    typeof identifier === "string" &&
    identifier.trim().length > 0 &&
    identifier.length <= 500 &&
    !identifier.includes("://")
  );
}
