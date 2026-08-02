import type { PublishingMediaObject } from "../persistence/PublishingMediaObject.js";
import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { PublishingProvider } from "../providers/PublishingProvider.js";

const REQUIRED_KEYS = Object.freeze([
  "orderedIndex",
  "objectKey",
  "objectVersion",
  "checksum",
  "byteLength",
  "contentType",
]);
const ALLOWED_KEYS = new Set([
  ...REQUIRED_KEYS,
  "durationSeconds",
  "width",
  "height",
  "videoCodec",
  "audioCodec",
  "hasAudio",
]);

export const parsePublishingWorkflowMediaObject = (
  provider: PublishingProvider,
  value: unknown,
): PublishingMediaObject => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ProviderRuntimeError(provider, "invalid_request");
  }

  const object = value as Readonly<Record<string, unknown>>;

  if (
    REQUIRED_KEYS.some((key) => !Object.hasOwn(object, key)) ||
    Object.keys(object).some((key) => !ALLOWED_KEYS.has(key)) ||
    !Number.isSafeInteger(object["orderedIndex"]) ||
    typeof object["objectKey"] !== "string" ||
    typeof object["objectVersion"] !== "string" ||
    typeof object["checksum"] !== "string" ||
    !Number.isSafeInteger(object["byteLength"]) ||
    typeof object["contentType"] !== "string" ||
    (object["durationSeconds"] !== undefined &&
      typeof object["durationSeconds"] !== "number") ||
    (object["width"] !== undefined && typeof object["width"] !== "number") ||
    (object["height"] !== undefined && typeof object["height"] !== "number") ||
    (object["videoCodec"] !== undefined &&
      typeof object["videoCodec"] !== "string") ||
    (object["audioCodec"] !== undefined &&
      typeof object["audioCodec"] !== "string") ||
    (object["hasAudio"] !== undefined &&
      typeof object["hasAudio"] !== "boolean")
  ) {
    throw new ProviderRuntimeError(provider, "invalid_request");
  }

  return Object.freeze({
    orderedIndex: object["orderedIndex"] as number,
    objectKey: object["objectKey"],
    objectVersion: object["objectVersion"],
    checksum: object["checksum"],
    byteLength: object["byteLength"] as number,
    contentType: object["contentType"],
    ...(object["durationSeconds"] === undefined
      ? {}
      : { durationSeconds: object["durationSeconds"] as number }),
    ...(object["width"] === undefined
      ? {}
      : { width: object["width"] as number }),
    ...(object["height"] === undefined
      ? {}
      : { height: object["height"] as number }),
    ...(object["videoCodec"] === undefined
      ? {}
      : { videoCodec: object["videoCodec"] as string }),
    ...(object["audioCodec"] === undefined
      ? {}
      : { audioCodec: object["audioCodec"] as string }),
    ...(object["hasAudio"] === undefined
      ? {}
      : { hasAudio: object["hasAudio"] as boolean }),
  });
};
