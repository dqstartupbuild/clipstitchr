import { canonicalizeHookLabSourceUrl } from "@/lib/clipstitchr/server/hookLab/canonicalizeHookLabSourceUrl";
import { getHookLabSourcePlatform } from "@/lib/clipstitchr/server/hookLab/getHookLabSourcePlatform";
import { normalizeHookLabSourceCreatedAt } from "@/lib/clipstitchr/server/hookLab/normalizeHookLabSourceCreatedAt";
import { normalizeHookLabAuthorProfileUrl } from "@/lib/clipstitchr/server/hookLab/normalizeHookLabAuthorProfileUrl";
import { readHookLabSourceString } from "@/lib/clipstitchr/server/hookLab/readHookLabSourceString";
import { readHookLabSourceNumber } from "@/lib/clipstitchr/server/hookLab/readHookLabSourceNumber";
import { readHookLabSourceStringArray } from "@/lib/clipstitchr/server/hookLab/readHookLabSourceStringArray";
import type { HookLabImportedPost } from "@/lib/clipstitchr/types/HookLabImportedPost";

export function createHookLabInstagramSource(
  item: unknown,
  requestedUrl: string,
): HookLabImportedPost {
  const error = readHookLabSourceString(item, ["error", "errorDescription"]);
  if (error) {
    throw new Error("Instagram could not return that public post.");
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
  const temporaryVideoUrl = readHookLabSourceString(item, [
    "videoUrl",
    "video_url",
    "downloadUrl",
  ]);
  const temporaryImageUrls = temporaryVideoUrl
    ? []
    : readHookLabSourceStringArray(item, [
        "images",
        "carouselImages",
        "childPosts.displayUrl",
        "childPosts.imageUrl",
        "displayUrl",
      ]);

  if (!temporaryVideoUrl && !temporaryImageUrls.length) {
    throw new Error("Instagram did not expose usable post media.");
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
    mediaKind: temporaryVideoUrl ? "video" : "slideshow",
    metrics: {
      commentCount: readHookLabSourceNumber(item, [
        "commentsCount",
        "commentCount",
        "comments",
      ]),
      likeCount: readHookLabSourceNumber(item, [
        "likesCount",
        "likeCount",
        "likes",
      ]),
      playCount: readHookLabSourceNumber(item, [
        "videoPlayCount",
        "videoViewCount",
        "viewCount",
        "views",
      ]),
      saveCount: readHookLabSourceNumber(item, [
        "savesCount",
        "saveCount",
      ]),
      shareCount: readHookLabSourceNumber(item, [
        "sharesCount",
        "shareCount",
      ]),
    },
    platform: "instagram",
    sourceCreatedAt: normalizeHookLabSourceCreatedAt(
      readHookLabSourceString(item, ["timestamp", "takenAt", "createdAt"]),
    ),
    sourcePostId: readHookLabSourceString(item, ["id", "shortCode", "shortcode"]),
    sourceText: readHookLabSourceString(item, ["caption", "text", "description"]),
    temporaryImageUrls: temporaryImageUrls.length
      ? temporaryImageUrls
      : undefined,
    temporaryVideoUrl,
    thumbnailUrl: readHookLabSourceString(item, [
      "displayUrl",
      "thumbnailUrl",
      "imageUrl",
    ]),
  };
}
