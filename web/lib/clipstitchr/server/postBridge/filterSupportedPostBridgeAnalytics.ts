import { isPostBridgePlatform } from "@/lib/clipstitchr/server/postBridge/isPostBridgePlatform";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";

export function filterSupportedPostBridgeAnalytics(
  analytics: (PostBridgeAnalytics & { platform: unknown })[],
) {
  return analytics.filter(
    (item): item is PostBridgeAnalytics => isPostBridgePlatform(item.platform),
  );
}
