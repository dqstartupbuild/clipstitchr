import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import type { PublishingApiCreatePostRequest } from "./PublishingApiCreatePostRequest.js";
import { assertExactPublishingApiKeys } from "./assertExactPublishingApiKeys.js";
import { readPublishingApiDestinationRequest } from "./readPublishingApiDestinationRequest.js";
import { readPublishingApiIdentifier } from "./readPublishingApiIdentifier.js";
import { readPublishingApiMediaManifest } from "./readPublishingApiMediaManifest.js";
import { readPublishingApiRecord } from "./readPublishingApiRecord.js";
import { readPublishingApiSchedule } from "./readPublishingApiSchedule.js";
import { readPublishingApiSha256 } from "./readPublishingApiSha256.js";
import { throwInvalidPublishingApiPostRequest } from "./throwInvalidPublishingApiPostRequest.js";

export const readPublishingApiCreatePostRequest = (
  value: unknown,
): PublishingApiCreatePostRequest => {
  const record = readPublishingApiRecord(value, "invalid_post_request");
  assertExactPublishingApiKeys(
    record,
    [
      "caption",
      "destinations",
      "idempotencyKey",
      "intent",
      "media",
      "mediaRevision",
      "productId",
      "resolvedMedia",
    ],
    ["schedule"],
    "invalid_post_request",
  );
  if (
    typeof record["caption"] !== "string" ||
    record["caption"].length > 5_000 ||
    !Array.isArray(record["destinations"]) ||
    record["destinations"].length < 1 ||
    record["destinations"].length > 100 ||
    (record["intent"] !== "draft" &&
      record["intent"] !== "publish-now" &&
      record["intent"] !== "schedule")
  ) {
    return throwInvalidPublishingApiPostRequest();
  }
  const destinations = Object.freeze(
    record["destinations"].map(readPublishingApiDestinationRequest),
  );
  if (
    destinations.some(({ provider }) => provider !== "youtube") &&
    record["caption"].length > 2_000
  ) {
    return throwInvalidPublishingApiPostRequest();
  }
  if (
    new Set(destinations.map(({ integrationId }) => integrationId)).size !==
    destinations.length
  ) {
    return throwInvalidPublishingApiPostRequest();
  }
  const media = readPublishingApiRecord(record["media"], "invalid_post_request");
  assertExactPublishingApiKeys(
    media,
    ["kind", "recordId"],
    [],
    "invalid_post_request",
  );
  if (
    media["kind"] !== "library-media" &&
    media["kind"] !== "stitch" &&
    media["kind"] !== "swipe" &&
    media["kind"] !== "studio-clip-output" &&
    media["kind"] !== "studio-stitch-output"
  ) {
    return throwInvalidPublishingApiPostRequest();
  }
  const resolvedMedia = readPublishingApiMediaManifest(record["resolvedMedia"]);
  const mediaRevision = readPublishingApiSha256(
    record["mediaRevision"],
    "invalid_post_request",
  );
  const recordId = readPublishingApiIdentifier(
    media["recordId"],
    "invalid_post_request",
  );
  const expectedSourceKind = media["kind"] === "library-media"
    ? "library"
    : media["kind"];
  if (
    mediaRevision !== resolvedMedia.sourceRevision ||
    recordId !== resolvedMedia.sourceRecordId ||
    expectedSourceKind !== resolvedMedia.sourceKind ||
    (record["intent"] === "schedule") !== (record["schedule"] !== undefined)
  ) {
    if (mediaRevision !== resolvedMedia.sourceRevision) {
      throw new PublishingServiceHttpError(409, "stale_media_revision");
    }
    return throwInvalidPublishingApiPostRequest();
  }
  const schedule =
    record["schedule"] === undefined
      ? undefined
      : readPublishingApiSchedule(record["schedule"]);

  return Object.freeze({
    caption: record["caption"],
    destinations,
    idempotencyKey: readPublishingApiIdentifier(
      record["idempotencyKey"],
      "invalid_post_request",
    ),
    productId: readPublishingApiIdentifier(
      record["productId"],
      "invalid_post_request",
    ),
    intent: record["intent"],
    media: Object.freeze({ kind: media["kind"], recordId }),
    mediaRevision,
    resolvedMedia,
    ...(schedule === undefined ? {} : { schedule }),
  });
};
