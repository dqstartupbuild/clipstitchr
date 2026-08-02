import { listAllPostBridgePages } from "@/lib/clipstitchr/server/postBridge/listAllPostBridgePages";
import type { PostBridgePostResult } from "@/lib/clipstitchr/types/PostBridgePostResult";

const postBridgePostResultsPageSize = 100;

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
    const query = new URLSearchParams();

    for (const postId of chunk) {
      query.append("post_id", postId);
    }

    postResults.push(
      ...(await listAllPostBridgePages<PostBridgePostResult>({
        apiKey,
        pageSize: postBridgePostResultsPageSize,
        path: "/v1/post-results",
        query,
      })),
    );
  }

  return Array.from(
    new Map(postResults.map((postResult) => [postResult.id, postResult])).values(),
  );
}
