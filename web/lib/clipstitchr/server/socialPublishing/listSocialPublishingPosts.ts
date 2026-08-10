import { listAllSocialPublishingPages } from "@/lib/clipstitchr/server/socialPublishing/listAllSocialPublishingPages";
import { normalizeZernioPost } from "@/lib/clipstitchr/server/socialPublishing/zernio/normalizeZernioPost";
import type { ZernioPost } from "@/lib/clipstitchr/server/socialPublishing/zernio/ZernioPost";

const socialPublishingPostsPageSize = 100;

export async function listSocialPublishingPosts(apiKey: string) {
  const posts = await listAllSocialPublishingPages<ZernioPost>({
    apiKey,
    pageSize: socialPublishingPostsPageSize,
    path: "/v1/posts",
    query: new URLSearchParams({ source: "zernio" }),
  });

  return posts.map(normalizeZernioPost);
}
