import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import { assertPublishingMediaObjects } from "../persistence/assertPublishingMediaObjects.js";
import type { PublishingApiMediaManifest } from "./PublishingApiMediaManifest.js";
import { assertExactPublishingApiKeys } from "./assertExactPublishingApiKeys.js";
import { createPublishingApiValueDigest } from "./createPublishingApiValueDigest.js";
import { readPublishingApiIdentifier } from "./readPublishingApiIdentifier.js";
import { readPublishingApiMediaObject } from "./readPublishingApiMediaObject.js";
import { readPublishingApiRecord } from "./readPublishingApiRecord.js";
import { readPublishingApiSha256 } from "./readPublishingApiSha256.js";

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
      record["sourceKind"] !== "swipe" &&
      record["sourceKind"] !== "studio-clip-output" &&
      record["sourceKind"] !== "studio-stitch-output")
  ) {
    throw new PublishingServiceHttpError(400, "invalid_media_manifest");
  }

  const objects = Object.freeze(
    record["objects"].map(readPublishingApiMediaObject),
  );
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
  const expectedContentChecksum = createPublishingApiValueDigest(
    objects.map(({ byteLength, checksum, orderedIndex }) => ({
      byteLength,
      checksum,
      orderedIndex,
    })),
  );
  const expectedSourceRevision = createPublishingApiValueDigest({
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
