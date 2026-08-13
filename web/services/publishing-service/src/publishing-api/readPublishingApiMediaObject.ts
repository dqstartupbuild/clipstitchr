import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import type { PublishingMediaObject } from "../persistence/PublishingMediaObject.js";
import { assertExactPublishingApiKeys } from "./assertExactPublishingApiKeys.js";
import { readOptionalPublishingApiMediaNumber } from "./readOptionalPublishingApiMediaNumber.js";
import { readOptionalPublishingApiMediaString } from "./readOptionalPublishingApiMediaString.js";
import { readPublishingApiRecord } from "./readPublishingApiRecord.js";
import { readPublishingApiSha256 } from "./readPublishingApiSha256.js";

const REQUIRED_OBJECT_KEYS = [
  "byteLength",
  "checksum",
  "contentType",
  "objectKey",
  "objectVersion",
  "orderedIndex",
] as const;
const OPTIONAL_OBJECT_KEYS = [
  "audioCodec",
  "durationSeconds",
  "hasAudio",
  "height",
  "videoCodec",
  "width",
] as const;

export const readPublishingApiMediaObject = (
  value: unknown,
): PublishingMediaObject => {
  const record = readPublishingApiRecord(value, "invalid_media_manifest");
  assertExactPublishingApiKeys(
    record,
    REQUIRED_OBJECT_KEYS,
    OPTIONAL_OBJECT_KEYS,
    "invalid_media_manifest",
  );

  if (
    typeof record["byteLength"] !== "number" ||
    typeof record["contentType"] !== "string" ||
    typeof record["objectKey"] !== "string" ||
    typeof record["objectVersion"] !== "string" ||
    typeof record["orderedIndex"] !== "number" ||
    (record["hasAudio"] !== undefined &&
      typeof record["hasAudio"] !== "boolean") ||
    (record["audioCodec"] !== undefined &&
      typeof record["audioCodec"] !== "string") ||
    (record["durationSeconds"] !== undefined &&
      typeof record["durationSeconds"] !== "number") ||
    (record["height"] !== undefined && typeof record["height"] !== "number") ||
    (record["videoCodec"] !== undefined &&
      typeof record["videoCodec"] !== "string") ||
    (record["width"] !== undefined && typeof record["width"] !== "number")
  ) {
    throw new PublishingServiceHttpError(400, "invalid_media_manifest");
  }

  return Object.freeze({
    ...(record["audioCodec"] === undefined
      ? {}
      : {
          audioCodec: readOptionalPublishingApiMediaString(
            record["audioCodec"],
          )!,
        }),
    byteLength: record["byteLength"],
    checksum: readPublishingApiSha256(
      record["checksum"],
      "invalid_media_manifest",
    ),
    contentType: record["contentType"],
    ...(record["durationSeconds"] === undefined
      ? {}
      : {
          durationSeconds: readOptionalPublishingApiMediaNumber(
            record["durationSeconds"],
          )!,
        }),
    ...(record["hasAudio"] === undefined
      ? {}
      : { hasAudio: record["hasAudio"] }),
    ...(record["height"] === undefined
      ? {}
      : {
          height: readOptionalPublishingApiMediaNumber(record["height"])!,
        }),
    objectKey: record["objectKey"],
    objectVersion: record["objectVersion"],
    orderedIndex: record["orderedIndex"],
    ...(record["videoCodec"] === undefined
      ? {}
      : {
          videoCodec: readOptionalPublishingApiMediaString(
            record["videoCodec"],
          )!,
        }),
    ...(record["width"] === undefined
      ? {}
      : { width: readOptionalPublishingApiMediaNumber(record["width"])! }),
  });
};
