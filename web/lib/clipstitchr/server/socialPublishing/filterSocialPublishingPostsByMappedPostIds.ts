import type { SocialPublishingPost } from "@/lib/clipstitchr/types/SocialPublishingPost";

export function filterSocialPublishingPostsByMappedPostIds(
  posts: SocialPublishingPost[],
  postIds: string[],
) {
  const mappedPostIds = new Set(postIds);

  return posts.filter((post) => mappedPostIds.has(post.id));
}
