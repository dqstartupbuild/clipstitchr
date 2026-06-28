import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";
import { getPostBridgeAnalyticsCreatedAtMs } from "@/lib/clipstitchr/utils/getPostBridgeAnalyticsCreatedAtMs";

export function getPostBridgeAnalyticsCreatedAtLabel(item: PostBridgeAnalytics) {
  const createdAtMs = getPostBridgeAnalyticsCreatedAtMs(item);

  if (createdAtMs === null) {
    return "Post date not available";
  }

  return `Posted ${new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(createdAtMs))}`;
}
