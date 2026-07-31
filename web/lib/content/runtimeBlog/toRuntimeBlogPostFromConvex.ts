import { createCanonicalUrl } from "@/lib/site";
import { renderRuntimeBlogContent } from "./renderRuntimeBlogContent";
import { estimateReadingTimeMinutes } from "./estimateReadingTimeMinutes";
import { getRuntimeBlogDateString } from "./getRuntimeBlogDateString";
import type { RuntimeBlogPost } from "./runtimeBlogPost";

export type ConvexBlogPost = {
  slug: string;
  title: string;
  seoTitle?: string;
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

export function toRuntimeBlogPostFromConvex(
  post: ConvexBlogPost,
): RuntimeBlogPost {
  const url = `/blog/${post.slug}`;

  return {
    slug: post.slug,
    url,
    title: post.title,
    seoTitle: post.seoTitle,
    description: post.metaDescription,
    category: post.source?.trim() || "Articles",
    tags: post.tags,
    author: "ClipStitchr",
    date: getRuntimeBlogDateString(post.createdAt ?? post.publishedAt),
    updated: getRuntimeBlogDateString(post.updatedAt),
    image: post.imageUrl,
    readingTimeMinutes: estimateReadingTimeMinutes(post.content),
    bodyHtml: renderRuntimeBlogContent({
      contentFormat: post.contentFormat,
      content: post.content,
      contentHtml: post.contentHtml,
      title: post.title,
    }),
    canonical: createCanonicalUrl(url),
    source: "convex",
  };
}
