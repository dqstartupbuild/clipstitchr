import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import type { PublishingApiCompatibilityRequest } from "./PublishingApiCompatibilityRequest.js";
import { assertExactPublishingApiKeys } from "./assertExactPublishingApiKeys.js";
import { readPublishingApiIdentifier } from "./readPublishingApiIdentifier.js";
import { readPublishingApiMediaManifest } from "./readPublishingApiMediaManifest.js";
import { readPublishingApiRecord } from "./readPublishingApiRecord.js";
import { readPublishingApiSha256 } from "./readPublishingApiSha256.js";

export const readPublishingApiCompatibilityRequest = (
  value: unknown,
): PublishingApiCompatibilityRequest => {
  const record = readPublishingApiRecord(
    value,
    "invalid_compatibility_request",
  );
  assertExactPublishingApiKeys(
    record,
    ["destinations", "media", "mediaRevision"],
    [],
    "invalid_compatibility_request",
  );
  if (
    !Array.isArray(record["destinations"]) ||
    record["destinations"].length < 1 ||
    record["destinations"].length > 100
  ) {
    throw new PublishingServiceHttpError(400, "invalid_compatibility_request");
  }
  const destinations = Object.freeze(
    record["destinations"].map((value) => {
      const destination = readPublishingApiRecord(
        value,
        "invalid_compatibility_request",
      );
      assertExactPublishingApiKeys(
        destination,
        ["integrationId", "provider"],
        [],
        "invalid_compatibility_request",
      );
      if (
        destination["provider"] !== "instagram" &&
        destination["provider"] !== "tiktok" &&
        destination["provider"] !== "youtube"
      ) {
        throw new PublishingServiceHttpError(
          400,
          "invalid_compatibility_request",
        );
      }
      return Object.freeze({
        integrationId: readPublishingApiIdentifier(
          destination["integrationId"],
          "invalid_compatibility_request",
        ),
        provider: destination["provider"],
      });
    }),
  );
  if (
    new Set(destinations.map(({ integrationId }) => integrationId)).size !==
    destinations.length
  ) {
    throw new PublishingServiceHttpError(400, "invalid_compatibility_request");
  }
  const media = readPublishingApiMediaManifest(record["media"]);
  const mediaRevision = readPublishingApiSha256(
    record["mediaRevision"],
    "invalid_compatibility_request",
  );
  if (media.sourceRevision !== mediaRevision) {
    throw new PublishingServiceHttpError(409, "stale_media_revision");
  }
  return Object.freeze({ destinations, media, mediaRevision });
};
