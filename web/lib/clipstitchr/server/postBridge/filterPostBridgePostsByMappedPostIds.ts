import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";

export function filterPostBridgePostsByMappedPostIds(
  posts: PostBridgePost[],
  postIds: string[],
) {
  const mappedPostIds = new Set(postIds);

  return posts.filter((post) => mappedPostIds.has(post.id));
}
