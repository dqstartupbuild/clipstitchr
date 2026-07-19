import { createSupportedPostBridgePlatformQuery } from "@/lib/clipstitchr/server/postBridge/createSupportedPostBridgePlatformQuery";
import { listAllPostBridgePages } from "@/lib/clipstitchr/server/postBridge/listAllPostBridgePages";
import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";

const postBridgePostsPageSize = 100;

export async function listPostBridgePosts(apiKey: string) {
  return listAllPostBridgePages<PostBridgePost>({
    apiKey,
    pageSize: postBridgePostsPageSize,
    path: "/v1/posts",
    query: createSupportedPostBridgePlatformQuery(postBridgePostsPageSize),
  });
}
