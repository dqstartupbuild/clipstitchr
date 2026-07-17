import { requestPostBridge } from "@/lib/clipstitchr/server/postBridge/requestPostBridge";
import { filterSupportedPostBridgeAnalytics } from "@/lib/clipstitchr/server/postBridge/filterSupportedPostBridgeAnalytics";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";

const postBridgeAnalyticsPageSize = 100;

type ListPostBridgeAnalyticsResponse = {
  data: PostBridgeAnalytics[];
};

export async function listPostBridgeAnalytics(
  apiKey: string,
  postResultIds: string[] = [],
) {
  const uniquePostResultIds = Array.from(
    new Set(postResultIds.map((id) => id.trim())),
  ).filter(Boolean);

  if (uniquePostResultIds.length === 0) {
    const query = new URLSearchParams({
      limit: String(postBridgeAnalyticsPageSize),
      timeframe: "all",
    });
    const response = await requestPostBridge<ListPostBridgeAnalyticsResponse>(
      "/v1/analytics",
      { apiKey, query },
    );

    return filterSupportedPostBridgeAnalytics(response.data);
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
      limit: String(postBridgeAnalyticsPageSize),
      timeframe: "all",
    });

    for (const postResultId of chunk) {
      query.append("post_result_id", postResultId);
    }

    const response = await requestPostBridge<ListPostBridgeAnalyticsResponse>(
      "/v1/analytics",
      { apiKey, query },
    );

    analytics.push(...response.data);
  }

  const dedupedAnalytics = Array.from(
    new Map(analytics.map((item) => [item.id, item])).values(),
  );

  return filterSupportedPostBridgeAnalytics(dedupedAnalytics);
}
