import type { PublishingApiDestinationRequest } from "./PublishingApiDestinationRequest.js";
import { assertExactPublishingApiKeys } from "./assertExactPublishingApiKeys.js";
import { readPublishingApiIdentifier } from "./readPublishingApiIdentifier.js";
import { readPublishingApiRecord } from "./readPublishingApiRecord.js";
import { readPublishingApiYouTubeSettings } from "./readPublishingApiYouTubeSettings.js";
import { throwInvalidPublishingApiPostRequest } from "./throwInvalidPublishingApiPostRequest.js";

export const readPublishingApiDestinationRequest = (
  value: unknown,
): PublishingApiDestinationRequest => {
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

  if (record["provider"] === "youtube") {
    return Object.freeze({
      integrationId,
      provider: "youtube",
      settings: readPublishingApiYouTubeSettings(settings),
    });
  }

  if (record["provider"] === "instagram") {
    assertExactPublishingApiKeys(
      settings,
      ["placement"],
      [],
      "invalid_post_request",
    );
    if (settings["placement"] !== "feed" && settings["placement"] !== "story") {
      return throwInvalidPublishingApiPostRequest();
    }
    return Object.freeze({
      integrationId,
      provider: "instagram",
      settings: Object.freeze({ placement: settings["placement"] }),
    });
  }

  if (record["provider"] !== "tiktok") {
    return throwInvalidPublishingApiPostRequest();
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
    return throwInvalidPublishingApiPostRequest();
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
