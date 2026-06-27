import { readPostBridgeClientErrorMessage } from "@/lib/clipstitchr/client/readPostBridgeClientErrorMessage";
import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";

export async function fetchPostBridgePosts() {
  const response = await fetch("/api/post-bridge/posts");

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
