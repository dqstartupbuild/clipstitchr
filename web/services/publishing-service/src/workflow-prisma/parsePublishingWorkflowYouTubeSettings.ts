import type { PublishingWorkflowYouTubeSettings } from "../workflow/PublishingWorkflowYouTubeSettings.js";
import { hasExactObjectKeys } from "./hasExactObjectKeys.js";
import { parsePublishingWorkflowMediaManifest } from "./parsePublishingWorkflowMediaManifest.js";
import { throwInvalidPublishingWorkflowYouTubeSettings } from "./throwInvalidPublishingWorkflowYouTubeSettings.js";

const REQUIRED_KEYS = Object.freeze(["madeForKids", "title", "visibility"]);
const OPTIONAL_KEYS = new Set(["description", "tags", "thumbnail"]);
const THUMBNAIL_KEYS = Object.freeze([
  "contentChecksum",
  "objects",
  "sourceKind",
  "sourceRecordId",
  "sourceRevision",
]);
const SOURCE_KINDS = new Set([
  "library",
  "stitch",
  "swipe",
  "studio-clip-output",
  "studio-stitch-output",
]);

export const parsePublishingWorkflowYouTubeSettings = (
  settings: Readonly<Record<string, unknown>>,
): PublishingWorkflowYouTubeSettings => {
  if (
    REQUIRED_KEYS.some((key) => !Object.hasOwn(settings, key)) ||
    Object.keys(settings).some(
      (key) => !REQUIRED_KEYS.includes(key) && !OPTIONAL_KEYS.has(key),
    ) ||
    typeof settings["title"] !== "string" ||
    settings["title"].trim().length < 2 ||
    settings["title"].trim().length > 100 ||
    (settings["description"] !== undefined &&
      (typeof settings["description"] !== "string" ||
        settings["description"].length > 5_000)) ||
    (settings["visibility"] !== "private" &&
      settings["visibility"] !== "public" &&
      settings["visibility"] !== "unlisted") ||
    typeof settings["madeForKids"] !== "boolean"
  ) {
    return throwInvalidPublishingWorkflowYouTubeSettings();
  }

  const tagsValue = settings["tags"];
  const tags = tagsValue === undefined ? [] : tagsValue;
  if (
    !Array.isArray(tags) ||
    tags.length > 100 ||
    tags.some((tag) => typeof tag !== "string" || tag.length < 1 || tag.length > 500) ||
    new Set(tags).size !== tags.length ||
    tags.reduce(
      (total, tag) => total + (tag as string).length + (/\s/u.test(tag as string) ? 2 : 0),
      0,
    ) > 500
  ) {
    return throwInvalidPublishingWorkflowYouTubeSettings();
  }

  let thumbnail;
  if (settings["thumbnail"] !== undefined) {
    const value = settings["thumbnail"];
    if (
      typeof value !== "object" ||
      value === null ||
      Array.isArray(value) ||
      !hasExactObjectKeys(value as Readonly<Record<string, unknown>>, THUMBNAIL_KEYS)
    ) {
      return throwInvalidPublishingWorkflowYouTubeSettings();
    }
    const manifest = value as Readonly<Record<string, unknown>>;
    if (
      !SOURCE_KINDS.has(manifest["sourceKind"] as string) ||
      typeof manifest["sourceRecordId"] !== "string" ||
      typeof manifest["sourceRevision"] !== "string" ||
      typeof manifest["contentChecksum"] !== "string"
    ) {
      return throwInvalidPublishingWorkflowYouTubeSettings();
    }
    const objects = parsePublishingWorkflowMediaManifest(
      "youtube",
      manifest["objects"],
    );
    const object = objects[0];
    if (
      objects.length !== 1 ||
      object === undefined ||
      (object.contentType !== "image/jpeg" && object.contentType !== "image/png") ||
      object.byteLength > 2_097_152
    ) {
      return throwInvalidPublishingWorkflowYouTubeSettings();
    }
    thumbnail = object;
  }

  return Object.freeze({
    provider: "youtube",
    title: settings["title"].trim(),
    ...(settings["description"] === undefined
      ? {}
      : { description: settings["description"] as string }),
    visibility: settings["visibility"],
    madeForKids: settings["madeForKids"],
    tags: Object.freeze([...(tags as string[])]),
    ...(thumbnail === undefined ? {} : { thumbnail }),
  });
};
