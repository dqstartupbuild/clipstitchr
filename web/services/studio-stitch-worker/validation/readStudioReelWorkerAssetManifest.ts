import type { StudioStitchAssetRef } from "../../../lib/clipstitchr/types/studioStitch/StudioStitchAssetRef";
import type { StudioReelWorkerAssetManifest } from "../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerAssetManifest";
import { STUDIO_REEL_WORKER_LIMITS } from "../constants/studioReelWorkerLimits";
import { StudioReelWorkerError } from "../errors/StudioReelWorkerError";
import { assertStudioReelWorkerObjectKey } from "../security/assertStudioReelWorkerObjectKey";
import { isStudioReelWorkerRecord } from "./isStudioReelWorkerRecord";

export function readStudioReelWorkerAssetManifest(
  value: unknown,
  ownerId: string,
): StudioReelWorkerAssetManifest {
  if (!isStudioReelWorkerRecord(value) || !isStudioReelWorkerRecord(value.source)) {
    throw new StudioReelWorkerError({
      code: "INVALID_CLAIM_ASSET",
      kind: "permanent",
      publicMessage: "A Studio Stitch claim asset is invalid.",
    });
  }
  const source = value.source as unknown as StudioStitchAssetRef;
  const sourceValid =
    (source.kind === "videoClip" && typeof source.videoClipId === "string") ||
    (source.kind === "stitch" && typeof source.stitchId === "string") ||
    (source.kind === "studioOutput" && typeof source.outputId === "string") ||
    (source.kind === "studioUpload" && typeof source.objectKey === "string");
  if (
    !sourceValid ||
    typeof value.objectKey !== "string" ||
    typeof value.contentType !== "string" ||
    typeof value.sizeBytes !== "number" ||
    !Number.isSafeInteger(value.sizeBytes) ||
    value.sizeBytes < 1 ||
    value.sizeBytes > STUDIO_REEL_WORKER_LIMITS.inputBytes ||
    typeof value.durationSeconds !== "number" ||
    !Number.isFinite(value.durationSeconds) ||
    value.durationSeconds <= 0 ||
    value.durationSeconds > 3_600 ||
    (value.sha256 !== undefined &&
      (typeof value.sha256 !== "string" || !/^[a-f0-9]{64}$/u.test(value.sha256))) ||
    (value.objectVersion !== undefined &&
      (typeof value.objectVersion !== "string" || value.objectVersion.length > 256))
  ) {
    throw new StudioReelWorkerError({
      code: "INVALID_CLAIM_ASSET",
      kind: "permanent",
      publicMessage: "A Studio Stitch claim asset is invalid.",
    });
  }
  assertStudioReelWorkerObjectKey(ownerId, value.objectKey);
  return value as unknown as StudioReelWorkerAssetManifest;
}
