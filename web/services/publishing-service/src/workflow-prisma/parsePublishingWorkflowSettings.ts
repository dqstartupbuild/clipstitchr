import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { PublishingProvider } from "../providers/PublishingProvider.js";
import type { PublishingWorkflowDestinationSettings } from "../workflow/PublishingWorkflowDestinationSettings.js";
import { hasExactObjectKeys } from "./hasExactObjectKeys.js";
import { parsePublishingWorkflowYouTubeSettings } from "./parsePublishingWorkflowYouTubeSettings.js";

const INSTAGRAM_KEYS = Object.freeze(["placement"]);
const TIKTOK_INBOX_KEYS = Object.freeze(["mode"]);
const TIKTOK_DIRECT_KEYS = Object.freeze([
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
]);

export const parsePublishingWorkflowSettings = (
  provider: PublishingProvider,
  value: string | null,
): PublishingWorkflowDestinationSettings => {
  let parsed: unknown;

  try {
    parsed = value === null ? null : JSON.parse(value);
  } catch {
    throw new ProviderRuntimeError(provider, "invalid_request");
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new ProviderRuntimeError(provider, "invalid_request");
  }

  const settings = parsed as Readonly<Record<string, unknown>>;

  if (provider === "youtube") {
    return parsePublishingWorkflowYouTubeSettings(settings);
  }

  if (provider === "instagram" || provider === "instagram-standalone") {
    if (
      !hasExactObjectKeys(settings, INSTAGRAM_KEYS) ||
      (settings["placement"] !== "feed" && settings["placement"] !== "story")
    ) {
      throw new ProviderRuntimeError(provider, "invalid_request");
    }

    return Object.freeze({
      provider: "instagram",
      placement: settings["placement"],
    });
  }

  if (
    settings["mode"] === "inbox" &&
    hasExactObjectKeys(settings, TIKTOK_INBOX_KEYS)
  ) {
    return Object.freeze({ provider: "tiktok", mode: "inbox" });
  }

  if (
    settings["mode"] !== "direct" ||
    !hasExactObjectKeys(settings, TIKTOK_DIRECT_KEYS) ||
    typeof settings["allowComment"] !== "boolean" ||
    typeof settings["allowDuet"] !== "boolean" ||
    typeof settings["allowStitch"] !== "boolean" ||
    typeof settings["autoAddMusic"] !== "boolean" ||
    typeof settings["brandContent"] !== "boolean" ||
    typeof settings["brandOrganic"] !== "boolean" ||
    settings["consentConfirmed"] !== true ||
    !Number.isSafeInteger(settings["creatorInfoFetchedAt"]) ||
    (settings["creatorInfoFetchedAt"] as number) < 0 ||
    typeof settings["isAigc"] !== "boolean" ||
    typeof settings["privacyLevel"] !== "string" ||
    settings["privacyLevel"].length < 1 ||
    settings["privacyLevel"].length > 200
  ) {
    throw new ProviderRuntimeError(provider, "invalid_request");
  }

  return Object.freeze({
    provider: "tiktok",
    mode: "direct",
    allowComment: settings["allowComment"],
    allowDuet: settings["allowDuet"],
    allowStitch: settings["allowStitch"],
    autoAddMusic: settings["autoAddMusic"],
    brandContent: settings["brandContent"],
    brandOrganic: settings["brandOrganic"],
    consentConfirmed: true,
    creatorInfoFetchedAt: settings["creatorInfoFetchedAt"] as number,
    isAigc: settings["isAigc"],
    privacyLevel: settings["privacyLevel"],
  });
};
