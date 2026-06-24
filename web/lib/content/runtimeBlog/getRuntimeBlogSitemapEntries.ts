import type { MetadataRoute } from "next";
import { getPublishedBlogPosts } from "@/lib/content/queries";
import { fetchConvexBlogPosts } from "./fetchConvexBlogPosts";
import { toRuntimeBlogPostFromConvex } from "./toRuntimeBlogPostFromConvex";

export async function getRuntimeBlogSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const mdxSlugs = new Set(getPublishedBlogPosts().map((post) => post.slug));
  const convexPosts = await fetchConvexBlogPosts();

  return convexPosts
    .filter((post) => !mdxSlugs.has(post.slug))
    .map(toRuntimeBlogPostFromConvex)
    .map((post) => ({
      url: post.canonical,
      lastModified: new Date(post.updated ?? post.date),
      changeFrequency: "monthly" as const,
      priority: 0.78,
      ...(post.image ? { images: [post.image] } : {}),
    }));
}
