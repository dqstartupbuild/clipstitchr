import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import remarkGfm from "remark-gfm";
import { blogDocumentSchema } from "./lib/content/schema";
import { createCanonicalUrl } from "./lib/site";

function estimateReadingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

const blog = defineCollection({
  name: "blog",
  directory: "content/blog",
  include: "**/*.mdx",
  schema: blogDocumentSchema,
  transform: async (document, context) => {
    const url = `/blog/${document.slug}`;
    const expectedCanonical = createCanonicalUrl(url);

    if (document.canonical !== expectedCanonical) {
      throw new Error(
        `Canonical mismatch for ${document._meta.filePath}: expected ${expectedCanonical}`,
      );
    }

    const body = await compileMDX(context, document, {
      remarkPlugins: [remarkGfm],
    });

    return {
      ...document,
      body,
      excerpt: document.excerpt ?? document.description,
      readingTimeMinutes: estimateReadingTime(document.content),
      url,
    };
  },
});

export default defineConfig({
  content: [blog],
});
