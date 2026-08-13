import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import { STUDIO_CLIPS_INPUT_CONTENT_TYPES } from "../constants/studioClipsMediaTypes";
import type { StudioClipsMediaProbe } from "../contracts/StudioClipsMediaProbe";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";
import { assertStudioClipsBoundedNumber } from "./assertStudioClipsBoundedNumber";
import { assertStudioClipsExactKeys } from "./assertStudioClipsExactKeys";
import { getStudioClipsContentTypeIsAllowed } from "./getStudioClipsContentTypeIsAllowed";
import { getStudioClipsValueIsRecord } from "./getStudioClipsValueIsRecord";

const allowedContainers = new Set(["m4v", "matroska", "mkv", "mov", "mp4", "webm"]);
const codecPattern = /^[A-Za-z0-9._-]{1,80}$/;
const contentTypeContainers: Record<string, ReadonlySet<string>> = {
  "video/mp4": new Set(["m4v", "mp4"]),
  "video/quicktime": new Set(["mov"]),
  "video/webm": new Set(["webm"]),
  "video/x-m4v": new Set(["m4v", "mp4"]),
  "video/x-matroska": new Set(["matroska", "mkv"]),
};

export function assertStudioClipsMediaProbe(
  value: unknown,
  options: {
    maximumSizeBytes?: number;
    requireAudio?: boolean;
  } = {},
): asserts value is StudioClipsMediaProbe {
  const maximumSizeBytes =
    options.maximumSizeBytes ?? STUDIO_CLIPS_LIMITS.inputSizeBytes;
  const requireAudio = options.requireAudio ?? true;

  if (!getStudioClipsValueIsRecord(value)) {
    throw new StudioClipsWorkerError({
      code: "INVALID_MEDIA_PROBE",
      kind: "permanent",
      publicMessage: "The video metadata could not be validated.",
    });
  }

  assertStudioClipsExactKeys(
    value,
    [
      "audioCodec",
      "container",
      "contentType",
      "durationSeconds",
      "hasAudio",
      "hasVideo",
      "height",
      "sizeBytes",
      "videoCodec",
      "width",
    ],
    "Video metadata",
  );

  const hasValidAudio =
    value.hasAudio === true
      ? typeof value.audioCodec === "string" &&
        codecPattern.test(value.audioCodec)
      : value.hasAudio === false &&
        value.audioCodec === undefined &&
        !requireAudio;

  if (
    typeof value.container !== "string" ||
    !allowedContainers.has(value.container.toLowerCase()) ||
    !getStudioClipsContentTypeIsAllowed(
      value.contentType,
      STUDIO_CLIPS_INPUT_CONTENT_TYPES,
    ) ||
    value.hasVideo !== true ||
    !hasValidAudio ||
    typeof value.videoCodec !== "string" ||
    !codecPattern.test(value.videoCodec) ||
    !contentTypeContainers[value.contentType]?.has(value.container.toLowerCase())
  ) {
    throw new StudioClipsWorkerError({
      code: "UNSUPPORTED_INPUT_MEDIA",
      kind: "permanent",
      publicMessage: "The source is not a supported video file.",
    });
  }

  assertStudioClipsBoundedNumber(value.durationSeconds, {
    label: "Video duration",
    maximum: STUDIO_CLIPS_LIMITS.inputDurationSeconds,
    minimum: 0.01,
  });
  assertStudioClipsBoundedNumber(value.sizeBytes, {
    integer: true,
    label: "Video size",
    maximum: maximumSizeBytes,
    minimum: 1,
  });
  assertStudioClipsBoundedNumber(value.width, {
    integer: true,
    label: "Video width",
    maximum: STUDIO_CLIPS_LIMITS.mediaDimensionPixels,
    minimum: 1,
  });
  assertStudioClipsBoundedNumber(value.height, {
    integer: true,
    label: "Video height",
    maximum: STUDIO_CLIPS_LIMITS.mediaDimensionPixels,
    minimum: 1,
  });
}
