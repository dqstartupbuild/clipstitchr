import type { BlogPostCard } from "./blogPostCard";
import type { ConvexBlogPostCard } from "./ConvexBlogPostCard";
import { getRuntimeBlogDateString } from "./getRuntimeBlogDateString";

export function toBlogPostCardFromConvexBlogPostCard(
  post: ConvexBlogPostCard,
): BlogPostCard {
  return {
    slug: post.slug,
    url: `/blog/${post.slug}`,
    title: post.title,
    description: post.metaDescription,
    category: post.source?.trim() || "Articles",
    tags: post.tags,
    date: getRuntimeBlogDateString(post.createdAt ?? post.publishedAt),
    updated: getRuntimeBlogDateString(post.updatedAt),
    readingTimeMinutes: post.readingTimeMinutes,
    featured: false,
  };
}
