import { assertStudioClipsBoundedText } from "../studioClipsTasks/assertStudioClipsBoundedText";
import { assertStudioClipsIdentifier } from "../studioClipsTasks/assertStudioClipsIdentifier";
import { STUDIO_CLIPS_PERSISTENCE_LIMITS } from "../studioClipsTasks/studioClipsPersistenceLimits";

export function normalizeStudioClipsDurableOutput(
  value: {
    artifactId: string;
    audioCodec?: string;
    contentType: string;
    durationSeconds: number;
    fileName?: string;
    hasAudio: boolean;
    height: number;
    objectKey: string;
    sha256: string;
    sizeBytes: number;
    videoCodec: string;
    width: number;
    cleanMaster?: {
      contentType: string;
      objectKey: string;
      sha256: string;
      sizeBytes: number;
    };
  },
  input: { ownerId: string; productId: string; taskId: string },
) {
  const artifactId = assertStudioClipsIdentifier(value.artifactId, "Artifact ID");
  const contentType = value.contentType.toLowerCase().split(";", 1)[0];
  if (!contentType.startsWith("video/") || contentType.length > 120) {
    throw new Error("Studio Clips output content type is invalid.");
  }
  if (
    !Number.isInteger(value.sizeBytes) ||
    value.sizeBytes <= 0 ||
    value.sizeBytes > STUDIO_CLIPS_PERSISTENCE_LIMITS.inputSizeBytes
  ) {
    throw new Error("Studio Clips output size is invalid.");
  }
  if (!/^[a-f0-9]{64}$/i.test(value.sha256)) {
    throw new Error("Studio Clips output digest is invalid.");
  }
  const expectedPrefix = [
    `users/${encodeURIComponent(input.ownerId)}/studio/v1/studio-clips`,
    encodeURIComponent(input.productId),
    encodeURIComponent(input.taskId),
    encodeURIComponent(artifactId),
    "",
  ].join("/");
  if (
    value.objectKey.length > 1_024 ||
    !value.objectKey.startsWith(expectedPrefix) ||
    value.objectKey.includes("\\") ||
    value.objectKey.includes("..") ||
    value.objectKey.includes("?") ||
    value.objectKey.includes("#") ||
    /[\u0000-\u001f\u007f]/.test(value.objectKey)
  ) {
    throw new Error("Studio Clips output key is outside the task namespace.");
  }
  if (
    !Number.isFinite(value.durationSeconds) ||
    value.durationSeconds <= 0 ||
    value.durationSeconds > STUDIO_CLIPS_PERSISTENCE_LIMITS.inputDurationSeconds
  ) {
    throw new Error("Studio Clips output duration is invalid.");
  }
  for (const [label, dimension] of [
    ["width", value.width],
    ["height", value.height],
  ] as const) {
    if (!Number.isInteger(dimension) || dimension < 16 || dimension > 16_384) {
      throw new Error(`Studio Clips output ${label} is invalid.`);
    }
  }
  if (typeof value.hasAudio !== "boolean") {
    throw new Error("Studio Clips output audio state is invalid.");
  }
  const videoCodec = value.videoCodec?.trim().toLowerCase();
  const audioCodec = value.audioCodec?.trim().toLowerCase();
  if (!videoCodec || videoCodec.length > 64 || !/^[a-z0-9._-]+$/u.test(videoCodec)) {
    throw new Error("Studio Clips output video codec is invalid.");
  }
  if (
    (value.hasAudio &&
      (!audioCodec || audioCodec.length > 64 || !/^[a-z0-9._-]+$/u.test(audioCodec))) ||
    (!value.hasAudio && audioCodec)
  ) {
    throw new Error("Studio Clips output audio codec is invalid.");
  }
  const fileName = value.fileName
    ? assertStudioClipsBoundedText(value.fileName, {
        label: "Studio Clips output file name",
        maxLength: 240,
      })
    : undefined;
  if (fileName && /[\\/]/.test(fileName)) {
    throw new Error("Studio Clips output file name is invalid.");
  }
  let cleanMaster:
    | { contentType: string; objectKey: string; sha256: string; sizeBytes: number }
    | undefined;
  if (value.cleanMaster) {
    const cleanContentType = value.cleanMaster.contentType.toLowerCase().split(";", 1)[0];
    if (
      !cleanContentType.startsWith("video/") ||
      !Number.isInteger(value.cleanMaster.sizeBytes) ||
      value.cleanMaster.sizeBytes < 1 ||
      value.cleanMaster.sizeBytes > STUDIO_CLIPS_PERSISTENCE_LIMITS.inputSizeBytes ||
      !/^[a-f0-9]{64}$/iu.test(value.cleanMaster.sha256) ||
      value.cleanMaster.objectKey.length > 1_024 ||
      !value.cleanMaster.objectKey.startsWith(expectedPrefix) ||
      !value.cleanMaster.objectKey.includes("/_clean/") ||
      value.cleanMaster.objectKey.includes("\\") ||
      value.cleanMaster.objectKey.includes("..") ||
      value.cleanMaster.objectKey.includes("?") ||
      value.cleanMaster.objectKey.includes("#")
    ) {
      throw new Error("Studio Clips clean master is invalid.");
    }
    cleanMaster = {
      contentType: cleanContentType,
      objectKey: value.cleanMaster.objectKey,
      sha256: value.cleanMaster.sha256.toLowerCase(),
      sizeBytes: value.cleanMaster.sizeBytes,
    };
  }
  return {
    artifactId,
    ...(audioCodec ? { audioCodec } : {}),
    contentType,
    durationSeconds: value.durationSeconds,
    ...(fileName ? { fileName } : {}),
    hasAudio: value.hasAudio,
    height: value.height,
    objectKey: value.objectKey,
    sha256: value.sha256.toLowerCase(),
    sizeBytes: value.sizeBytes,
    videoCodec,
    width: value.width,
    ...(cleanMaster ? { cleanMaster } : {}),
  };
}
