import { createSupportedPostBridgePlatformQuery } from "@/lib/clipstitchr/server/postBridge/createSupportedPostBridgePlatformQuery";
import { requestPostBridge } from "@/lib/clipstitchr/server/postBridge/requestPostBridge";
import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";

type ListPostBridgePostsResponse = {
  data: PostBridgePost[];
};

export async function listPostBridgePosts(apiKey: string) {
  const response = await requestPostBridge<ListPostBridgePostsResponse>(
    "/v1/posts",
    {
      apiKey,
      query: createSupportedPostBridgePlatformQuery(),
    },
  );

  return response.data;
}
