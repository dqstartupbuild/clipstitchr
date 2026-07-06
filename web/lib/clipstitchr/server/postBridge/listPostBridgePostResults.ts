import { requestPostBridge } from "@/lib/clipstitchr/server/postBridge/requestPostBridge";
import type { PostBridgePostResult } from "@/lib/clipstitchr/types/PostBridgePostResult";

type ListPostBridgePostResultsResponse = {
  data: PostBridgePostResult[];
};

export async function listPostBridgePostResults(
  apiKey: string,
  postIds: string[],
) {
  const uniquePostIds = Array.from(new Set(postIds.map((id) => id.trim())))
    .filter(Boolean)
    .slice(0, 100);

  if (uniquePostIds.length === 0) {
    return [];
  }

  const query = new URLSearchParams({
    limit: "100",
  });

  for (const postId of uniquePostIds) {
    query.append("post_id", postId);
  }

  const response = await requestPostBridge<ListPostBridgePostResultsResponse>(
    "/v1/post-results",
    { apiKey, query },
  );

  return response.data;
}
