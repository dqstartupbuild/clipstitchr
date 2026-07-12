import { canonicalizeHookLabSourceUrl } from "@/lib/clipstitchr/server/hookLab/canonicalizeHookLabSourceUrl";
import { getHookLabSourcePlatform } from "@/lib/clipstitchr/server/hookLab/getHookLabSourcePlatform";
import { normalizeHookLabSourceCreatedAt } from "@/lib/clipstitchr/server/hookLab/normalizeHookLabSourceCreatedAt";
import { normalizeHookLabAuthorProfileUrl } from "@/lib/clipstitchr/server/hookLab/normalizeHookLabAuthorProfileUrl";
import { readHookLabSourceString } from "@/lib/clipstitchr/server/hookLab/readHookLabSourceString";
import type { HookLabImportedSource } from "@/lib/clipstitchr/types/HookLabImportedSource";

export function createHookLabInstagramSource(
  item: unknown,
  requestedUrl: string,
): HookLabImportedSource {
  const error = readHookLabSourceString(item, ["error", "errorDescription"]);
  const sourceType = readHookLabSourceString(item, ["type", "productType"]);

  if (error) {
    throw new Error("Instagram could not return that public post.");
  }

  if (sourceType && /sidecar|carousel|image/i.test(sourceType)) {
    throw new Error("Hook Lab currently supports Instagram video posts and reels.");
  }

  const actorUrl = readHookLabSourceString(item, ["url", "inputUrl"]);
  let canonicalUrl: string;

  try {
    canonicalUrl = canonicalizeHookLabSourceUrl(actorUrl ?? requestedUrl);

    if (getHookLabSourcePlatform(canonicalUrl) !== "instagram") {
      throw new Error("Unexpected source platform.");
    }
  } catch {
    canonicalUrl = canonicalizeHookLabSourceUrl(requestedUrl);

    if (getHookLabSourcePlatform(canonicalUrl) !== "instagram") {
      throw new Error("Paste a public Instagram post link.");
    }
  }

  return {
    authorName: readHookLabSourceString(item, [
      "ownerFullName",
      "owner.fullName",
      "authorName",
    ]),
    authorProfileUrl: normalizeHookLabAuthorProfileUrl(
      readHookLabSourceString(item, [
        "ownerProfileUrl",
        "owner.profileUrl",
      ]),
      "instagram",
    ),
    authorUsername: readHookLabSourceString(item, [
      "ownerUsername",
      "owner.username",
      "username",
    ]),
    canonicalUrl,
    platform: "instagram",
    sourceCreatedAt: normalizeHookLabSourceCreatedAt(
      readHookLabSourceString(item, ["timestamp", "takenAt", "createdAt"]),
    ),
    sourcePostId: readHookLabSourceString(item, ["id", "shortCode", "shortcode"]),
    sourceText: readHookLabSourceString(item, ["caption", "text", "description"]),
    temporaryVideoUrl: readHookLabSourceString(item, [
      "videoUrl",
      "video_url",
      "downloadUrl",
    ]),
    thumbnailUrl: readHookLabSourceString(item, [
      "displayUrl",
      "thumbnailUrl",
      "imageUrl",
    ]),
  };
}
