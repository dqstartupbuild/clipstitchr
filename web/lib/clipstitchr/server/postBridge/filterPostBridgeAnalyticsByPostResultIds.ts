import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";

export function filterPostBridgeAnalyticsByPostResultIds(
  analytics: PostBridgeAnalytics[],
  postResultIds: string[],
) {
  const mappedPostResultIds = new Set(postResultIds);

  return analytics.filter((item) =>
    mappedPostResultIds.has(item.post_result_id),
  );
}
