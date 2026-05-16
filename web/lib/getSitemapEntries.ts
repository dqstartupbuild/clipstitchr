import type { MetadataRoute } from "next";
import { getCustomerDocs } from "@/lib/clipstitchr/docs/getCustomerDocs";
import { getPublishedBlogPosts } from "@/lib/content/queries";
import { createCanonicalUrl, site } from "@/lib/site";

export function getSitemapEntries(): MetadataRoute.Sitemap {
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

  const docsEntries = getCustomerDocs().map((doc) => ({
    url: createCanonicalUrl(`/docs/${doc.slug}`),
    lastModified: new Date(doc.updated),
    changeFrequency: "monthly" as const,
    priority: doc.category === "start" ? 0.84 : 0.8,
  }));

  return [...staticEntries, ...docsEntries, ...postEntries];
}
