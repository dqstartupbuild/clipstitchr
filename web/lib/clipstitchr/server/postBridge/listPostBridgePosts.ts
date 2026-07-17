import { createSupportedPostBridgePlatformQuery } from "@/lib/clipstitchr/server/postBridge/createSupportedPostBridgePlatformQuery";
import { requestPostBridge } from "@/lib/clipstitchr/server/postBridge/requestPostBridge";
import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";

const postBridgePostsMaxPages = 5;
const postBridgePostsPageSize = 100;

type ListPostBridgePostsResponse = {
  data: PostBridgePost[];
};

function readPostBridgeNextCursor(response: unknown) {
  if (!response || typeof response !== "object") {
    return null;
  }

  const candidate = response as {
    cursor?: unknown;
    next_cursor?: unknown;
    nextCursor?: unknown;
  };
  const cursor =
    candidate.next_cursor ?? candidate.nextCursor ?? candidate.cursor;

  return typeof cursor === "string" && cursor.trim() ? cursor : null;
}

export async function listPostBridgePosts(apiKey: string) {
  const posts: PostBridgePost[] = [];
  const seenPostIds = new Set<string>();
  let cursor: string | null = null;

  for (let page = 0; page < postBridgePostsMaxPages; page += 1) {
    const query = createSupportedPostBridgePlatformQuery(
      postBridgePostsPageSize,
    );

    if (cursor) {
      query.set("cursor", cursor);
    }

    const response = await requestPostBridge<ListPostBridgePostsResponse>(
      "/v1/posts",
      { apiKey, query },
    );
    const pagePosts = response.data.filter((post) => !seenPostIds.has(post.id));

    pagePosts.forEach((post) => {
      seenPostIds.add(post.id);
      posts.push(post);
    });

    const nextCursor = readPostBridgeNextCursor(response);

    if (
      !nextCursor ||
      nextCursor === cursor ||
      pagePosts.length === 0 ||
      response.data.length < postBridgePostsPageSize
    ) {
      break;
    }

    cursor = nextCursor;
  }

  return posts;
}
