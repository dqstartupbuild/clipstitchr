import { requestPostBridge } from "@/lib/clipstitchr/server/postBridge/requestPostBridge";
import { filterSupportedPostBridgeAnalytics } from "@/lib/clipstitchr/server/postBridge/filterSupportedPostBridgeAnalytics";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";

type ListPostBridgeAnalyticsResponse = {
  data: PostBridgeAnalytics[];
};

export async function listPostBridgeAnalytics(
  apiKey: string,
  postResultIds: string[] = [],
) {
  const query = new URLSearchParams({
    limit: "100",
    timeframe: "all",
  });
  const uniquePostResultIds = Array.from(
    new Set(postResultIds.map((id) => id.trim())),
  )
    .filter(Boolean)
    .slice(0, 100);

  for (const postResultId of uniquePostResultIds) {
    query.append("post_result_id", postResultId);
  }

  const response = await requestPostBridge<ListPostBridgeAnalyticsResponse>(
    "/v1/analytics",
    { apiKey, query },
  );

  return filterSupportedPostBridgeAnalytics(response.data);
}
