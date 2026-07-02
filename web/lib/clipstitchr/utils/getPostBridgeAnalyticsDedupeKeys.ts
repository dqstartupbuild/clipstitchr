import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";
import { getPostBridgeUnknownString } from "@/lib/clipstitchr/utils/getPostBridgeUnknownString";

function normalizePostBridgeAnalyticsUrl(value: string) {
  try {
    const url = new URL(value);

    url.hash = "";
    url.search = "";

    return url.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return value.trim().replace(/\/$/, "").toLowerCase();
  }
}

export function getPostBridgeAnalyticsDedupeKeys(item: PostBridgeAnalytics) {
  const keys: string[] = [];
  const platformPostId = getPostBridgeUnknownString(item.platform_post_id);
  const shareUrl = getPostBridgeUnknownString(item.share_url);

  if (platformPostId) {
    keys.push(`${item.platform}:id:${platformPostId}`);
  }

  if (shareUrl) {
    keys.push(`${item.platform}:url:${normalizePostBridgeAnalyticsUrl(shareUrl)}`);
  }

  return keys;
}
