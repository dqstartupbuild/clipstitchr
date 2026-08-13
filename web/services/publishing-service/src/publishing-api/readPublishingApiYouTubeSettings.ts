import type { PublishingApiYouTubeSettings } from "./PublishingApiYouTubeSettings.js";
import { assertExactPublishingApiKeys } from "./assertExactPublishingApiKeys.js";
import { countPublishingApiYouTubeTagCharacters } from "./countPublishingApiYouTubeTagCharacters.js";
import { readPublishingApiMediaManifest } from "./readPublishingApiMediaManifest.js";
import { readPublishingApiRecord } from "./readPublishingApiRecord.js";
import { throwInvalidPublishingApiPostRequest } from "./throwInvalidPublishingApiPostRequest.js";

export const readPublishingApiYouTubeSettings = (
  value: unknown,
): PublishingApiYouTubeSettings => {
  const settings = readPublishingApiRecord(value, "invalid_post_request");
  assertExactPublishingApiKeys(
    settings,
    ["madeForKids", "title", "visibility"],
    ["description", "tags", "thumbnail"],
    "invalid_post_request",
  );
  const title = typeof settings["title"] === "string"
    ? settings["title"].trim()
    : "";
  const description = settings["description"];
  const visibility = settings["visibility"];
  if (
    title.length < 2 ||
    title.length > 100 ||
    (description !== undefined &&
      (typeof description !== "string" || description.length > 5_000)) ||
    (visibility !== "private" &&
      visibility !== "public" &&
      visibility !== "unlisted") ||
    typeof settings["madeForKids"] !== "boolean"
  ) {
    return throwInvalidPublishingApiPostRequest();
  }

  let tags: readonly string[] | undefined;
  if (settings["tags"] !== undefined) {
    if (!Array.isArray(settings["tags"]) || settings["tags"].length > 100) {
      return throwInvalidPublishingApiPostRequest();
    }
    const normalized = settings["tags"].map((tag) =>
      typeof tag === "string" ? tag.trim() : "",
    );
    if (
      normalized.some((tag) => tag.length < 1 || tag.length > 500) ||
      new Set(normalized).size !== normalized.length ||
      countPublishingApiYouTubeTagCharacters(normalized) > 500
    ) {
      return throwInvalidPublishingApiPostRequest();
    }
    tags = Object.freeze(normalized);
  }

  let thumbnail;
  if (settings["thumbnail"] !== undefined) {
    thumbnail = readPublishingApiMediaManifest(settings["thumbnail"]);
    const object = thumbnail.objects[0];
    const contentType = object?.contentType.split(";", 1)[0]?.trim().toLowerCase();
    if (
      thumbnail.objects.length !== 1 ||
      object === undefined ||
      (contentType !== "image/jpeg" && contentType !== "image/png") ||
      object.byteLength > 2_097_152
    ) {
      return throwInvalidPublishingApiPostRequest();
    }
  }

  return Object.freeze({
    title,
    ...(description === undefined ? {} : { description }),
    visibility,
    madeForKids: settings["madeForKids"],
    ...(tags === undefined ? {} : { tags }),
    ...(thumbnail === undefined ? {} : { thumbnail }),
  });
};
