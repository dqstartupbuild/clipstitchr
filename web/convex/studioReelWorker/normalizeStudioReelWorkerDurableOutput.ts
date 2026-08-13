import type { StudioReelWorkerDurableOutput } from "../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerDurableOutput";
import type { StudioStitchPipeline } from "../../lib/clipstitchr/types/studioStitch/StudioStitchPipeline";

export function normalizeStudioReelWorkerDurableOutput(
  output: StudioReelWorkerDurableOutput,
  scope: {
    ownerId: string;
    productId: string;
    runId: string;
    recipeId: string;
    pipeline: StudioStitchPipeline;
    durationSeconds: number;
  },
) {
  const expectedPrefix = [
    `users/${encodeURIComponent(scope.ownerId)}/studio/v1/media-output`,
    encodeURIComponent(scope.productId),
    encodeURIComponent(scope.runId),
    encodeURIComponent(scope.recipeId),
    "",
  ].join("/");
  const objectKey = output.objectKey.trim();
  if (
    objectKey.length <= expectedPrefix.length ||
    objectKey.length > 1_000 ||
    !objectKey.startsWith(expectedPrefix) ||
    objectKey.includes("..") ||
    objectKey.includes("\\") ||
    objectKey.includes("?") ||
    objectKey.includes("#") ||
    /[\u0000-\u001f\u007f]/.test(objectKey)
  ) {
    throw new Error("Studio Stitch output is outside the leased Product run.");
  }
  const sha256 = output.sha256.trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(sha256)) {
    throw new Error("Studio Stitch output checksum is invalid.");
  }
  const objectVersion = output.objectVersion.trim();
  if (
    objectVersion.length === 0 ||
    objectVersion.length > 240 ||
    /[\u0000-\u001f\u007f]/.test(objectVersion)
  ) {
    throw new Error("Studio Stitch output version is invalid.");
  }
  if (
    output.contentType !== "video/mp4" ||
    !Number.isInteger(output.sizeBytes) ||
    output.sizeBytes < 1 ||
    output.sizeBytes > 2 * 1024 * 1024 * 1024 ||
    !Number.isFinite(output.durationSeconds) ||
    Math.abs(output.durationSeconds - scope.durationSeconds) > 0.25 ||
    output.width !== 1080 ||
    output.height !== 1920 ||
    typeof output.hasAudio !== "boolean" ||
    (scope.pipeline === "talkingVideo" && !output.hasAudio)
  ) {
    throw new Error("Studio Stitch output media facts do not match its recipe.");
  }
  const videoCodec = output.videoCodec.trim().toLowerCase();
  const audioCodec = output.audioCodec?.trim().toLowerCase();
  if (
    !["h264", "avc1"].includes(videoCodec) ||
    (output.hasAudio && (!audioCodec || !["aac", "mp4a"].includes(audioCodec))) ||
    (!output.hasAudio && audioCodec !== undefined)
  ) {
    throw new Error("Studio Stitch output codecs are unsupported.");
  }
  return {
    recipeId: scope.recipeId,
    objectKey,
    objectVersion,
    contentType: "video/mp4" as const,
    sizeBytes: output.sizeBytes,
    sha256,
    durationSeconds: output.durationSeconds,
    width: output.width,
    height: output.height,
    hasAudio: output.hasAudio,
    videoCodec,
    ...(audioCodec ? { audioCodec } : {}),
  };
}
