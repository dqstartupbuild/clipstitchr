import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";
import type { PublishingMediaObject } from "./PublishingMediaObject.js";
import { assertDurableR2ObjectKey } from "./assertDurableR2ObjectKey.js";
import { assertDurableR2ObjectVersion } from "./assertDurableR2ObjectVersion.js";
import { assertSha256Digest } from "./assertSha256Digest.js";

const CONTENT_TYPE_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9!#$&^_.+-]{0,63}\/[A-Za-z0-9][A-Za-z0-9!#$&^_.+-]{0,63}$/u;
const CODEC_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._+-]{0,127}$/u;

export const assertPublishingMediaObjects = (
  objects: readonly PublishingMediaObject[],
): number => {
  if (objects.length < 1 || objects.length > 20) {
    throw new PublishingPersistenceValidationError("objects");
  }

  let totalByteLength = 0;

  objects.forEach((object, index) => {
    if (object.orderedIndex !== index) {
      throw new PublishingPersistenceValidationError("objects.orderedIndex");
    }
    assertDurableR2ObjectKey(object.objectKey);
    assertDurableR2ObjectVersion(object.objectVersion);
    assertSha256Digest(object.checksum, "objects.checksum");

    if (!Number.isSafeInteger(object.byteLength) || object.byteLength < 1) {
      throw new PublishingPersistenceValidationError("objects.byteLength");
    }

    if (!CONTENT_TYPE_PATTERN.test(object.contentType)) {
      throw new PublishingPersistenceValidationError("objects.contentType");
    }

    if (
      object.durationSeconds !== undefined &&
      (!Number.isFinite(object.durationSeconds) ||
        object.durationSeconds <= 0 ||
        object.durationSeconds > 86_400)
    ) {
      throw new PublishingPersistenceValidationError("objects.durationSeconds");
    }

    if (
      (object.width === undefined) !== (object.height === undefined) ||
      (object.width !== undefined &&
        (!Number.isSafeInteger(object.width) ||
          object.width < 1 ||
          object.width > 32_768)) ||
      (object.height !== undefined &&
        (!Number.isSafeInteger(object.height) ||
          object.height < 1 ||
          object.height > 32_768))
    ) {
      throw new PublishingPersistenceValidationError("objects.dimensions");
    }

    if (
      (object.videoCodec !== undefined &&
        !CODEC_PATTERN.test(object.videoCodec)) ||
      (object.audioCodec !== undefined &&
        !CODEC_PATTERN.test(object.audioCodec))
    ) {
      throw new PublishingPersistenceValidationError("objects.codec");
    }

    if (
      (object.hasAudio !== undefined && typeof object.hasAudio !== "boolean") ||
      (object.audioCodec !== undefined && object.hasAudio === false)
    ) {
      throw new PublishingPersistenceValidationError("objects.hasAudio");
    }

    totalByteLength += object.byteLength;
  });

  if (
    !Number.isSafeInteger(totalByteLength) ||
    totalByteLength > 2_147_483_647
  ) {
    throw new PublishingPersistenceValidationError("byteLength");
  }

  return totalByteLength;
};
