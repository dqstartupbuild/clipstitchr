import type { MetadataRoute } from "next";
import { getPublishedBlogPosts } from "@/lib/content/queries";
import { createCanonicalUrl } from "@/lib/site";
import { fetchConvexBlogPostCards } from "./fetchConvexBlogPostCards";
import { getRuntimeBlogDateString } from "./getRuntimeBlogDateString";

export async function getRuntimeBlogSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const mdxSlugs = new Set(getPublishedBlogPosts().map((post) => post.slug));
  const convexPosts = await fetchConvexBlogPostCards();

  return convexPosts
    .filter((post) => !mdxSlugs.has(post.slug))
    .map((post) => ({
      url: createCanonicalUrl(`/blog/${post.slug}`),
      lastModified: new Date(getRuntimeBlogDateString(post.updatedAt)),
      changeFrequency: "monthly" as const,
      priority: 0.78,
      ...(post.imageUrl ? { images: [post.imageUrl] } : {}),
    }));
}
