import { requestPostBridge } from "@/lib/clipstitchr/server/postBridge/requestPostBridge";
import type { PostBridgePostResult } from "@/lib/clipstitchr/types/PostBridgePostResult";

const postBridgePostResultsPageSize = 100;

type ListPostBridgePostResultsResponse = {
  data: PostBridgePostResult[];
};

export async function listPostBridgePostResults(
  apiKey: string,
  postIds: string[],
) {
  const uniquePostIds = Array.from(new Set(postIds.map((id) => id.trim())))
    .filter(Boolean);

  if (uniquePostIds.length === 0) {
    return [];
  }

  const postResults: PostBridgePostResult[] = [];

  for (
    let start = 0;
    start < uniquePostIds.length;
    start += postBridgePostResultsPageSize
  ) {
    const chunk = uniquePostIds.slice(
      start,
      start + postBridgePostResultsPageSize,
    );
    const query = new URLSearchParams({
      limit: String(postBridgePostResultsPageSize),
    });

    for (const postId of chunk) {
      query.append("post_id", postId);
    }

    const response =
      await requestPostBridge<ListPostBridgePostResultsResponse>(
        "/v1/post-results",
        { apiKey, query },
      );

    postResults.push(...response.data);
  }

  return Array.from(
    new Map(postResults.map((postResult) => [postResult.id, postResult])).values(),
  );
}
