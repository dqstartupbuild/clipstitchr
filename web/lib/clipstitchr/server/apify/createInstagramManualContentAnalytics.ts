import { getApifyNumber } from "@/lib/clipstitchr/server/apify/getApifyNumber";
import { getApifyString } from "@/lib/clipstitchr/server/apify/getApifyString";
import { getApifyTimestampIsoString } from "@/lib/clipstitchr/server/apify/getApifyTimestampIsoString";
import { normalizeApifyProfileUsername } from "@/lib/clipstitchr/server/apify/normalizeApifyProfileUsername";
import type { ContentAnalytics } from "@/lib/clipstitchr/types/ContentAnalytics";
import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";

export function createInstagramManualContentAnalytics(
  account: PostBridgeSocialAccount,
  record: Record<string, unknown>,
  syncedAt: string,
): ContentAnalytics | null {
  const username = normalizeApifyProfileUsername(account.username);
  const platformPostId = getApifyString(record, [
    "shortcode",
    "shortCode",
    "code",
    "id",
  ]);
  const shareUrl =
    getApifyString(record, ["url", "postUrl", "permalink"]) ||
    (platformPostId ? `https://www.instagram.com/p/${platformPostId}/` : "");
  const identity = platformPostId || shareUrl;

  if (!identity) {
    return null;
  }

  return {
    account_username: username,
    analytics_source: "manual",
    comment_count: getApifyNumber(record, [
      "commentsCount",
      "commentCount",
      "comments",
    ]),
    cover_image_url: getApifyString(record, [
      "displayUrl",
      "imageUrl",
      "thumbnailUrl",
      "coverUrl",
    ]),
    duration: getApifyNumber(record, ["videoDuration", "duration"]),
    id: `manual:instagram:${account.id}:${identity}`,
    last_synced_at: syncedAt,
    like_count: getApifyNumber(record, ["likesCount", "likeCount", "likes"]),
    match_confidence: null,
    platform: "instagram",
    platform_created_at:
      getApifyTimestampIsoString(
        getApifyString(record, ["timestamp", "takenAt", "takenAtTimestamp"]),
      ) ?? syncedAt,
    platform_post_id: platformPostId,
    post_result_id: `manual:instagram:${account.id}:${identity}`,
    share_count: 0,
    share_url: shareUrl,
    video_description: getApifyString(record, ["caption", "text", "description"]),
    view_count: getApifyNumber(record, [
      "videoViewCount",
      "videoPlayCount",
      "viewsCount",
      "viewCount",
      "playCount",
    ]),
  };
}
