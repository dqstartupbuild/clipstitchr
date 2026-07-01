import type { RssPost } from "@/lib/content/RssPost";
import { createCanonicalUrl } from "@/lib/site";
import type { ConvexBlogPostCard } from "./ConvexBlogPostCard";
import { getRuntimeBlogDateString } from "./getRuntimeBlogDateString";

export function toRssPostFromConvexBlogPostCard(
  post: ConvexBlogPostCard,
): RssPost {
  return {
    title: post.title,
    canonical: createCanonicalUrl(`/blog/${post.slug}`),
    date: getRuntimeBlogDateString(post.createdAt ?? post.publishedAt),
    description: post.metaDescription,
  };
}
