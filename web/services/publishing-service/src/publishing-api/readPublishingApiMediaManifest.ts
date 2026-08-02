import { createHash } from "node:crypto";

import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import { assertPublishingMediaObjects } from "../persistence/assertPublishingMediaObjects.js";
import type { PublishingMediaObject } from "../persistence/PublishingMediaObject.js";
import type { PublishingApiMediaManifest } from "./PublishingApiMediaManifest.js";
import { assertExactPublishingApiKeys } from "./assertExactPublishingApiKeys.js";
import { readPublishingApiIdentifier } from "./readPublishingApiIdentifier.js";
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

const readOptionalString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const readOptionalNumber = (value: unknown): number | undefined =>
  typeof value === "number" ? value : undefined;

const readMediaObject = (value: unknown): PublishingMediaObject => {
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
      : { audioCodec: readOptionalString(record["audioCodec"])! }),
    byteLength: record["byteLength"],
    checksum: readPublishingApiSha256(
      record["checksum"],
      "invalid_media_manifest",
    ),
    contentType: record["contentType"],
    ...(record["durationSeconds"] === undefined
      ? {}
      : { durationSeconds: readOptionalNumber(record["durationSeconds"])! }),
    ...(record["hasAudio"] === undefined
      ? {}
      : { hasAudio: record["hasAudio"] }),
    ...(record["height"] === undefined
      ? {}
      : { height: readOptionalNumber(record["height"])! }),
    objectKey: record["objectKey"],
    objectVersion: record["objectVersion"],
    orderedIndex: record["orderedIndex"],
    ...(record["videoCodec"] === undefined
      ? {}
      : { videoCodec: readOptionalString(record["videoCodec"])! }),
    ...(record["width"] === undefined
      ? {}
      : { width: readOptionalNumber(record["width"])! }),
  });
};

const digest = (value: unknown): string =>
  createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex");

export const readPublishingApiMediaManifest = (
  value: unknown,
): PublishingApiMediaManifest => {
  const record = readPublishingApiRecord(value, "invalid_media_manifest");
  assertExactPublishingApiKeys(
    record,
    [
      "contentChecksum",
      "objects",
      "sourceKind",
      "sourceRecordId",
      "sourceRevision",
    ],
    [],
    "invalid_media_manifest",
  );

  if (
    !Array.isArray(record["objects"]) ||
    (record["sourceKind"] !== "library" &&
      record["sourceKind"] !== "stitch" &&
      record["sourceKind"] !== "swipe")
  ) {
    throw new PublishingServiceHttpError(400, "invalid_media_manifest");
  }

  const objects = Object.freeze(record["objects"].map(readMediaObject));
  try {
    assertPublishingMediaObjects(objects);
  } catch {
    throw new PublishingServiceHttpError(400, "invalid_media_manifest");
  }
  const contentChecksum = readPublishingApiSha256(
    record["contentChecksum"],
    "invalid_media_manifest",
  );
  const sourceRecordId = readPublishingApiIdentifier(
    record["sourceRecordId"],
    "invalid_media_manifest",
  );
  const sourceRevision = readPublishingApiSha256(
    record["sourceRevision"],
    "invalid_media_manifest",
  );
  const expectedContentChecksum = digest(
    objects.map(({ byteLength, checksum, orderedIndex }) => ({
      byteLength,
      checksum,
      orderedIndex,
    })),
  );
  const expectedSourceRevision = digest({
    contentChecksum,
    objects,
    sourceKind: record["sourceKind"],
    sourceRecordId,
  });

  if (
    contentChecksum !== expectedContentChecksum ||
    sourceRevision !== expectedSourceRevision
  ) {
    throw new PublishingServiceHttpError(409, "stale_media_revision");
  }

  return Object.freeze({
    contentChecksum,
    objects,
    sourceKind: record["sourceKind"],
    sourceRecordId,
    sourceRevision,
  });
};
