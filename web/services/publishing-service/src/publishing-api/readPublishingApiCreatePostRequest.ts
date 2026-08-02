import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import type { PublishingApiCreatePostRequest } from "./PublishingApiCreatePostRequest.js";
import type { PublishingApiDestinationRequest } from "./PublishingApiDestinationRequest.js";
import { assertExactPublishingApiKeys } from "./assertExactPublishingApiKeys.js";
import { isPublishingApiTimeZone } from "./isPublishingApiTimeZone.js";
import { readPublishingApiIdentifier } from "./readPublishingApiIdentifier.js";
import { readPublishingApiMediaManifest } from "./readPublishingApiMediaManifest.js";
import { readPublishingApiRecord } from "./readPublishingApiRecord.js";
import { readPublishingApiSha256 } from "./readPublishingApiSha256.js";

const invalid = (): never => {
  throw new PublishingServiceHttpError(400, "invalid_post_request");
};

const readDestination = (value: unknown): PublishingApiDestinationRequest => {
  const record = readPublishingApiRecord(value, "invalid_post_request");
  assertExactPublishingApiKeys(
    record,
    ["integrationId", "provider", "settings"],
    [],
    "invalid_post_request",
  );
  const integrationId = readPublishingApiIdentifier(
    record["integrationId"],
    "invalid_post_request",
  );
  const settings = readPublishingApiRecord(
    record["settings"],
    "invalid_post_request",
  );

  if (record["provider"] === "instagram") {
    assertExactPublishingApiKeys(
      settings,
      ["placement"],
      [],
      "invalid_post_request",
    );
    if (settings["placement"] !== "feed" && settings["placement"] !== "story") {
      return invalid();
    }
    return Object.freeze({
      integrationId,
      provider: "instagram",
      settings: Object.freeze({ placement: settings["placement"] }),
    });
  }

  if (record["provider"] !== "tiktok") {
    return invalid();
  }

  if (settings["mode"] === "inbox") {
    assertExactPublishingApiKeys(
      settings,
      ["mode"],
      [],
      "invalid_post_request",
    );
    return Object.freeze({
      integrationId,
      provider: "tiktok",
      settings: Object.freeze({ mode: "inbox" }),
    });
  }

  assertExactPublishingApiKeys(
    settings,
    [
      "allowComment",
      "allowDuet",
      "allowStitch",
      "autoAddMusic",
      "brandContent",
      "brandOrganic",
      "consentConfirmed",
      "creatorInfoFetchedAt",
      "isAigc",
      "mode",
      "privacyLevel",
    ],
    [],
    "invalid_post_request",
  );
  const booleanKeys = [
    "allowComment",
    "allowDuet",
    "allowStitch",
    "autoAddMusic",
    "brandContent",
    "brandOrganic",
    "isAigc",
  ] as const;
  if (
    settings["mode"] !== "direct" ||
    settings["consentConfirmed"] !== true ||
    booleanKeys.some((key) => typeof settings[key] !== "boolean") ||
    !Number.isSafeInteger(settings["creatorInfoFetchedAt"]) ||
    (settings["creatorInfoFetchedAt"] as number) < 0 ||
    typeof settings["privacyLevel"] !== "string" ||
    settings["privacyLevel"].trim().length < 1 ||
    settings["privacyLevel"].trim().length > 128
  ) {
    return invalid();
  }

  return Object.freeze({
    integrationId,
    provider: "tiktok",
    settings: Object.freeze({
      allowComment: settings["allowComment"] as boolean,
      allowDuet: settings["allowDuet"] as boolean,
      allowStitch: settings["allowStitch"] as boolean,
      autoAddMusic: settings["autoAddMusic"] as boolean,
      brandContent: settings["brandContent"] as boolean,
      brandOrganic: settings["brandOrganic"] as boolean,
      consentConfirmed: true,
      creatorInfoFetchedAt: settings["creatorInfoFetchedAt"] as number,
      isAigc: settings["isAigc"] as boolean,
      mode: "direct",
      privacyLevel: settings["privacyLevel"].trim(),
    }),
  });
};

const readSchedule = (value: unknown) => {
  const schedule = readPublishingApiRecord(value, "invalid_post_request");
  assertExactPublishingApiKeys(
    schedule,
    ["localDateTime", "timeZone", "utcOffsetMinutes"],
    [],
    "invalid_post_request",
  );
  if (
    typeof schedule["localDateTime"] !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/u.test(schedule["localDateTime"]) ||
    !isPublishingApiTimeZone(schedule["timeZone"]) ||
    !Number.isInteger(schedule["utcOffsetMinutes"]) ||
    (schedule["utcOffsetMinutes"] as number) < -840 ||
    (schedule["utcOffsetMinutes"] as number) > 840
  ) {
    return invalid();
  }
  return Object.freeze({
    localDateTime: schedule["localDateTime"],
    timeZone: schedule["timeZone"],
    utcOffsetMinutes: schedule["utcOffsetMinutes"] as number,
  });
};

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
      "resolvedMedia",
    ],
    ["schedule"],
    "invalid_post_request",
  );
  if (
    typeof record["caption"] !== "string" ||
    record["caption"].length > 2_000 ||
    !Array.isArray(record["destinations"]) ||
    record["destinations"].length < 1 ||
    record["destinations"].length > 100 ||
    (record["intent"] !== "draft" &&
      record["intent"] !== "publish-now" &&
      record["intent"] !== "schedule")
  ) {
    return invalid();
  }
  const destinations = Object.freeze(record["destinations"].map(readDestination));
  if (new Set(destinations.map(({ integrationId }) => integrationId)).size !== destinations.length) {
    return invalid();
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
    media["kind"] !== "swipe"
  ) {
    return invalid();
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
  const expectedSourceKind =
    media["kind"] === "library-media" ? "library" : media["kind"];
  if (
    mediaRevision !== resolvedMedia.sourceRevision ||
    recordId !== resolvedMedia.sourceRecordId ||
    expectedSourceKind !== resolvedMedia.sourceKind ||
    (record["intent"] === "schedule") !== (record["schedule"] !== undefined)
  ) {
    if (mediaRevision !== resolvedMedia.sourceRevision) {
      throw new PublishingServiceHttpError(409, "stale_media_revision");
    }
    return invalid();
  }
  const schedule =
    record["schedule"] === undefined
      ? undefined
      : readSchedule(record["schedule"]);

  return Object.freeze({
    caption: record["caption"],
    destinations,
    idempotencyKey: readPublishingApiIdentifier(
      record["idempotencyKey"],
      "invalid_post_request",
    ),
    intent: record["intent"],
    media: Object.freeze({ kind: media["kind"], recordId }),
    mediaRevision,
    resolvedMedia,
    ...(schedule === undefined ? {} : { schedule }),
  });
};
