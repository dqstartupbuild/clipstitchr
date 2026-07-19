import { filterSupportedPostBridgeAnalytics } from "@/lib/clipstitchr/server/postBridge/filterSupportedPostBridgeAnalytics";
import { listAllPostBridgePages } from "@/lib/clipstitchr/server/postBridge/listAllPostBridgePages";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";

const postBridgeAnalyticsPageSize = 100;

export async function listPostBridgeAnalytics(
  apiKey: string,
  postResultIds: string[] = [],
) {
  const uniquePostResultIds = Array.from(
    new Set(postResultIds.map((id) => id.trim())),
  ).filter(Boolean);

  if (uniquePostResultIds.length === 0) {
    const query = new URLSearchParams({
      timeframe: "all",
    });
    const analytics = await listAllPostBridgePages<PostBridgeAnalytics>({
      apiKey,
      pageSize: postBridgeAnalyticsPageSize,
      path: "/v1/analytics",
      query,
    });

    return filterSupportedPostBridgeAnalytics(analytics);
  }

  const analytics: PostBridgeAnalytics[] = [];

  for (
    let start = 0;
    start < uniquePostResultIds.length;
    start += postBridgeAnalyticsPageSize
  ) {
    const chunk = uniquePostResultIds.slice(
      start,
      start + postBridgeAnalyticsPageSize,
    );
    const query = new URLSearchParams({
      timeframe: "all",
    });

    for (const postResultId of chunk) {
      query.append("post_result_id", postResultId);
    }

    analytics.push(
      ...(await listAllPostBridgePages<PostBridgeAnalytics>({
        apiKey,
        pageSize: postBridgeAnalyticsPageSize,
        path: "/v1/analytics",
        query,
      })),
    );
  }

  const dedupedAnalytics = Array.from(
    new Map(analytics.map((item) => [item.id, item])).values(),
  );

  return filterSupportedPostBridgeAnalytics(dedupedAnalytics);
}
