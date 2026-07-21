import { canonicalizeHookLabSourceUrl } from "@/lib/clipstitchr/server/hookLab/canonicalizeHookLabSourceUrl";
import { getHookLabSourcePlatform } from "@/lib/clipstitchr/server/hookLab/getHookLabSourcePlatform";
import { normalizeHookLabSourceCreatedAt } from "@/lib/clipstitchr/server/hookLab/normalizeHookLabSourceCreatedAt";
import { normalizeHookLabAuthorProfileUrl } from "@/lib/clipstitchr/server/hookLab/normalizeHookLabAuthorProfileUrl";
import { readHookLabSourceString } from "@/lib/clipstitchr/server/hookLab/readHookLabSourceString";
import { readHookLabSourceNumber } from "@/lib/clipstitchr/server/hookLab/readHookLabSourceNumber";
import { readHookLabSourceStringArray } from "@/lib/clipstitchr/server/hookLab/readHookLabSourceStringArray";
import type { HookLabImportedPost } from "@/lib/clipstitchr/types/HookLabImportedPost";

export function createHookLabTikTokSource(
  item: unknown,
  requestedUrl: string,
): HookLabImportedPost {
  const error = readHookLabSourceString(item, ["error", "errorCode"]);

  if (error) {
    throw new Error("TikTok could not return that public post.");
  }

  const actorUrl = readHookLabSourceString(item, [
    "webVideoUrl",
    "url",
    "submittedVideoUrl",
    "input",
  ]);
  let canonicalUrl: string;

  try {
    canonicalUrl = canonicalizeHookLabSourceUrl(actorUrl ?? requestedUrl);

    if (getHookLabSourcePlatform(canonicalUrl) !== "tiktok") {
      throw new Error("Unexpected source platform.");
    }
  } catch {
    canonicalUrl = canonicalizeHookLabSourceUrl(requestedUrl);

    if (getHookLabSourcePlatform(canonicalUrl) !== "tiktok") {
      throw new Error("Paste a public TikTok post link.");
    }
  }
  const sourcePostId =
    readHookLabSourceString(item, ["id", "videoId", "awemeId"]) ??
    canonicalUrl.match(/\/(?:video|photo)\/(\d+)$/)?.[1];
  const downloadedImageUrls = readHookLabSourceStringArray(item, [
    "slideshowImageLinks.downloadLink",
  ]);
  const temporaryImageUrls = downloadedImageUrls.length
    ? downloadedImageUrls
    : readHookLabSourceStringArray(item, [
        "slideshowImageLinks.tiktokLink",
      ]);

  return {
    authorName: readHookLabSourceString(item, [
      "authorMeta.nickName",
      "authorMeta.nickname",
      "authorName",
      "author.nickname",
    ]),
    authorProfileUrl: normalizeHookLabAuthorProfileUrl(
      readHookLabSourceString(item, [
        "authorMeta.profileUrl",
        "authorMeta.url",
        "author.profileUrl",
      ]),
      "tiktok",
    ),
    authorUsername: readHookLabSourceString(item, [
      "authorMeta.name",
      "authorMeta.uniqueId",
      "authorMeta.username",
      "author.username",
    ]),
    canonicalUrl,
    mediaKind: temporaryImageUrls.length ? "slideshow" : "video",
    metrics: {
      commentCount: readHookLabSourceNumber(item, [
        "commentCount",
        "comments",
        "stats.commentCount",
      ]),
      likeCount: readHookLabSourceNumber(item, [
        "diggCount",
        "likeCount",
        "likes",
        "stats.diggCount",
        "stats.likeCount",
      ]),
      playCount: readHookLabSourceNumber(item, [
        "playCount",
        "viewCount",
        "views",
        "stats.playCount",
        "stats.viewCount",
      ]),
      saveCount: readHookLabSourceNumber(item, [
        "collectCount",
        "saveCount",
        "stats.collectCount",
      ]),
      shareCount: readHookLabSourceNumber(item, [
        "shareCount",
        "shares",
        "stats.shareCount",
      ]),
    },
    platform: "tiktok",
    sourceCreatedAt: normalizeHookLabSourceCreatedAt(
      readHookLabSourceString(item, ["createTimeISO", "createTime", "timestamp"]),
    ),
    sourcePostId,
    sourceText: readHookLabSourceString(item, ["text", "description", "caption"]),
    temporaryImageUrls: temporaryImageUrls.length
      ? temporaryImageUrls
      : undefined,
    temporaryVideoUrl: temporaryImageUrls.length
      ? undefined
      : readHookLabSourceString(item, [
          "videoUrl",
          "downloadUrl",
          "mediaUrls",
          "videoMeta.downloadAddr",
          "videoMeta.downloadUrl",
          "videoMeta.playAddr",
        ]),
    thumbnailUrl: readHookLabSourceString(item, [
      "videoMeta.coverUrl",
      "videoMeta.originCoverUrl",
      "coverUrl",
      "thumbnailUrl",
    ]) ?? temporaryImageUrls[0],
  };
}
