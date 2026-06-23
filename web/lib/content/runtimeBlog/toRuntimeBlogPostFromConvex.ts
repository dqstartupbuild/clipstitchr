import { createCanonicalUrl } from "@/lib/site";
import { renderRuntimeBlogContent } from "./renderRuntimeBlogContent";
import { estimateReadingTimeMinutes } from "./estimateReadingTimeMinutes";
import type { RuntimeBlogPost } from "./runtimeBlogPost";

export type ConvexBlogPost = {
  slug: string;
  title: string;
  metaDescription: string;
  contentFormat: "mdx" | "markdown" | "html";
  content: string;
  contentHtml?: string;
  imageUrl?: string;
  tags: string[];
  source?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

function toDateString(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return parsed.toISOString().slice(0, 10);
}

export function toRuntimeBlogPostFromConvex(
  post: ConvexBlogPost,
): RuntimeBlogPost {
  const url = `/blog/${post.slug}`;

  return {
    slug: post.slug,
    url,
    title: post.title,
    description: post.metaDescription,
    category: post.source?.trim() || "Articles",
    tags: post.tags,
    author: post.source?.trim() || "ClipStitchr",
    date: toDateString(post.createdAt ?? post.publishedAt),
    updated: toDateString(post.updatedAt),
    image: post.imageUrl,
    readingTimeMinutes: estimateReadingTimeMinutes(post.content),
    bodyHtml: renderRuntimeBlogContent({
      contentFormat: post.contentFormat,
      content: post.content,
      contentHtml: post.contentHtml,
    }),
    canonical: createCanonicalUrl(url),
    source: "convex",
  };
}
