import { getApifyNestedNumber } from "@/lib/clipstitchr/server/apify/getApifyNestedNumber";
import { getApifyNestedString } from "@/lib/clipstitchr/server/apify/getApifyNestedString";
import { getApifyNumber } from "@/lib/clipstitchr/server/apify/getApifyNumber";
import { getApifyString } from "@/lib/clipstitchr/server/apify/getApifyString";
import { getApifyTimestampIsoString } from "@/lib/clipstitchr/server/apify/getApifyTimestampIsoString";
import { normalizeApifyProfileUsername } from "@/lib/clipstitchr/server/apify/normalizeApifyProfileUsername";
import type { ContentAnalytics } from "@/lib/clipstitchr/types/ContentAnalytics";
import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";

export function createTikTokManualContentAnalytics(
  account: PostBridgeSocialAccount,
  record: Record<string, unknown>,
  syncedAt: string,
): ContentAnalytics | null {
  const username = normalizeApifyProfileUsername(account.username);
  const platformPostId = getApifyString(record, [
    "id",
    "videoId",
    "awemeId",
    "itemId",
  ]);
  const shareUrl =
    getApifyString(record, ["webVideoUrl", "url", "shareUrl"]) ||
    (platformPostId ? `https://www.tiktok.com/@${username}/video/${platformPostId}` : "");
  const identity = platformPostId || shareUrl;

  if (!identity) {
    return null;
  }

  return {
    account_username: username,
    analytics_source: "manual",
    comment_count:
      getApifyNumber(record, ["commentCount", "comments", "commentsCount"]) ||
      getApifyNestedNumber(record, ["stats", "commentCount"]),
    cover_image_url:
      getApifyString(record, ["cover", "coverUrl", "thumbnail", "thumbnailUrl"]) ||
      getApifyNestedString(record, ["videoMeta", "coverUrl"]),
    duration: getApifyNestedNumber(record, ["videoMeta", "duration"]),
    id: `manual:tiktok:${account.id}:${identity}`,
    last_synced_at: syncedAt,
    like_count:
      getApifyNumber(record, ["diggCount", "likeCount", "likes", "likesCount"]) ||
      getApifyNestedNumber(record, ["stats", "diggCount"]),
    match_confidence: null,
    platform: "tiktok",
    platform_created_at:
      getApifyTimestampIsoString(
        getApifyString(record, ["createTimeISO", "createTimeISOString", "timestamp"]),
      ) ?? getApifyTimestampIsoString(record.createTime) ?? syncedAt,
    platform_post_id: platformPostId,
    post_result_id: `manual:tiktok:${account.id}:${identity}`,
    share_count:
      getApifyNumber(record, ["shareCount", "shares", "sharesCount"]) ||
      getApifyNestedNumber(record, ["stats", "shareCount"]),
    share_url: shareUrl,
    video_description: getApifyString(record, ["text", "description", "desc"]),
    view_count:
      getApifyNumber(record, ["playCount", "viewCount", "views", "viewsCount"]) ||
      getApifyNestedNumber(record, ["stats", "playCount"]),
  };
}
