import { createPostBridgeProductUrl } from "@/lib/clipstitchr/client/createPostBridgeProductUrl";
import { readPostBridgeClientErrorMessage } from "@/lib/clipstitchr/client/readPostBridgeClientErrorMessage";
import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";

type FetchPostBridgePostsOptions = {
  productId?: string;
};

export async function fetchPostBridgePosts({
  productId,
}: FetchPostBridgePostsOptions = {}) {
  const response = await fetch(
    createPostBridgeProductUrl("/api/post-bridge/posts", productId),
  );

  if (!response.ok) {
    throw new Error(
      await readPostBridgeClientErrorMessage(
        response,
        "Unable to load scheduled posts.",
      ),
    );
  }

  return ((await response.json()) as { posts: PostBridgePost[] }).posts;
}
