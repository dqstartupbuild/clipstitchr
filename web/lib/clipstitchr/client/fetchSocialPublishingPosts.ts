import { createSocialPublishingProductUrl } from "@/lib/clipstitchr/client/createSocialPublishingProductUrl";
import { readSocialPublishingClientErrorMessage } from "@/lib/clipstitchr/client/readSocialPublishingClientErrorMessage";
import type { SocialPublishingPost } from "@/lib/clipstitchr/types/SocialPublishingPost";

type FetchSocialPublishingPostsOptions = {
  productId?: string;
};

export async function fetchSocialPublishingPosts({
  productId,
}: FetchSocialPublishingPostsOptions = {}) {
  const response = await fetch(
    createSocialPublishingProductUrl("/api/social-publishing/posts", productId),
  );

  if (!response.ok) {
    throw new Error(
      await readSocialPublishingClientErrorMessage(
        response,
        "Unable to load scheduled posts.",
      ),
    );
  }

  return ((await response.json()) as { posts: SocialPublishingPost[] }).posts;
}
