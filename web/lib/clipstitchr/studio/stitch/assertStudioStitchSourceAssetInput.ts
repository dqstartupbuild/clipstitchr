import type { StudioStitchSourceAssetInput } from "../../types/studioStitch/StudioStitchSourceAssetInput";
import { isStudioStitchAssetRef } from "./isStudioStitchAssetRef";
import { isStudioStitchFrameAligned } from "./isStudioStitchFrameAligned";
import { normalizeStudioStitchText } from "./normalizeStudioStitchText";

export function assertStudioStitchSourceAssetInput(
  input: StudioStitchSourceAssetInput,
): void {
  normalizeStudioStitchText(input.assetId, "Source asset ID", 240);
  if (!isStudioStitchAssetRef(input.source)) {
    throw new Error("Source assets must use a supported durable reference.");
  }
  if (
    !Number.isFinite(input.sourceDurationSeconds) ||
    input.sourceDurationSeconds <= 0 ||
    input.sourceDurationSeconds > 86_400
  ) {
    throw new Error("Source duration must be between 0 and 86,400 seconds.");
  }
  if (
    !Number.isFinite(input.sourceOffsetSeconds) ||
    input.sourceOffsetSeconds < 0 ||
    input.sourceOffsetSeconds >= input.sourceDurationSeconds ||
    !isStudioStitchFrameAligned(input.sourceOffsetSeconds)
  ) {
    throw new Error("Source offset must be frame-aligned and inside the asset.");
  }
  if (
    !Number.isFinite(input.playbackRate) ||
    input.playbackRate < 0.25 ||
    input.playbackRate > 4
  ) {
    throw new Error("Playback rate must be between 0.25 and 4.");
  }
  if (
    input.creatorContinuityKey !== null &&
    (typeof input.creatorContinuityKey !== "string" ||
      input.creatorContinuityKey.trim().length === 0 ||
      input.creatorContinuityKey.length > 240)
  ) {
    throw new Error("Creator continuity keys must be non-empty when supplied.");
  }
}
