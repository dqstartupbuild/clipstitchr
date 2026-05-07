import type { MetadataRoute } from "next";
import { getPublishedBlogPosts } from "@/lib/content/queries";
import { createCanonicalUrl, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = site.staticPages.map((page) => ({
    url: createCanonicalUrl(page.pathname),
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const postEntries = getPublishedBlogPosts().map((post) => ({
    url: post.canonical,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: "monthly" as const,
    priority: 0.78,
  }));

  return [...staticEntries, ...postEntries];
}
